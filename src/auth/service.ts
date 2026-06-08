import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { Repository } from "./repository";
import { generateOTP, sendOTP } from "../utils/otp";
import { AuthTokens, IAuth, IFeedback, LoginCredentials, MapResponse, refreshPayload, RegisterProfile, RequestOtpDto, TokenPayload, User_Id } from "./type";
import { CustomError } from "../utils/customError";
import envConfig from "../config/env";
import { uploadFile, UploadResult } from "../utils/s3Client";
import { AuthModel, FeedbackModel } from "./model";

export class Service {
  private repository: Repository;

  constructor() {
    this.repository = new Repository();
  }

  private mapUserToResponse(message:string, data?:any): MapResponse{
      return {
          message,
          data
      }
  }

  
  private generateTokens(data: TokenPayload): AuthTokens {
    const accessTokenPayload = { ...data, type: "access" } as TokenPayload;
    const accessToken = jwt.sign(accessTokenPayload, envConfig.jwt.accesssecret, {
      // expiresIn: envConfig.jwt.accessExpirationMinutes,
    });
    
    const refreshTokenPayload = { userId: data.userId, type: "refresh" } as refreshPayload;
    const refreshToken = jwt.sign(refreshTokenPayload, envConfig.jwt.refreshsecret, {
      expiresIn: envConfig.jwt.refreshExpirationDays,
    });
    
    return { accessToken, refreshToken };
  }

  private checkValidTokenId (user:User_Id | undefined): string{
      if (!user || !user._id) {
    throw new CustomError("Invalid user", 401);
  }
  return user._id;
  }

  async requestOtp(req: Request): Promise<MapResponse> {
    const { mobile, userName } = req.body as RequestOtpDto;

    let user = await this.repository.findByMobile(mobile);
    const otp = generateOTP();

    if (user) {
      console.log("user", user._id, typeof(user._id), typeof(user.otp));
      await this.repository.saveOtp(user._id.toString(), otp.toString());
      console.log("check2")
    } else {
      const [_id, userId] = await Promise.all([uuidv4(), uuidv4()]);
      const newUser = {
        _id,
        userName,
        mobile,
        role: "user",
        userId, 
      };
      user = await this.repository.createNewUser(userName, mobile);
      await this.repository.saveOtp(user._id.toString(), otp.toString());
    }

    // await sendOTP(mobile, otp);
    return this.mapUserToResponse("OTP sent successfully");
  }


  async login(req: Request): Promise<AuthTokens>{
    const credentials: LoginCredentials = req.body;
    if(!credentials.mobile || !credentials.otp){
      throw new CustomError("Mobile number or otp required", 400);
    }

    const user = await this.repository.findByMobile(credentials.mobile);
    if(!user) throw new CustomError("Login failed. Please check your crendentials.", 401);

    if (!credentials.otp || !user.otp || !user.otpExpiresAt) {
      throw new CustomError('OTP validation failed. Missing values.', 400);
    }

    await this.repository.checkValidOtp(credentials.otp, user.otp, user.otpExpiresAt);
   
   
      
      await this.repository.removeOtp(user._id,user.otp);

      const payload: TokenPayload = {
        _id: user._id,
        userName: user.userName,
        mobile: user.mobile,
        userId: user.userId,
        role: user.role,
        gender: user.gender ?? null,
        type: "access"
      }
    

    return this.generateTokens(payload);

  }

  async getAllUserData(req: Request): Promise<MapResponse>{

    const page = parseInt(req.query.page as string) || 1;
    const batchSize = parseInt(req.query.batchSize as string) || 50;

    const skip: number = (Math.ceil(page/5)-1)*batchSize;

    const data = await this.repository.findDataWithBatchPagination<IAuth>(AuthModel,
      {},
      page,
      batchSize,
         {
             projection:{
                 otp:0,
                 otpExpiresAt:0,
                 _v:0,
                 archive:0
             },
             sort: {isAccept:1, createdAt: -1},
             lean: true,
             skip
         }
    );

    if(!data){
      throw new CustomError("User's data not found", 404)
    }

    return this.mapUserToResponse("User data listed successfully",data);
  }

  async  updateAllUserData (req: Request): Promise<MapResponse>{
        const id = req.query.id as string;
        const data = req.body;
        
        if (!id) {
          throw new CustomError("User ID is required in query params", 400);
        }
        
        if(!data){
            throw new CustomError("Update data not provided", 400)
        }
        
        const updateData = await this.repository.findWithIdAndUpdate(id, data);

        if(!updateData){
            throw new CustomError("user not found, update failed", 404)
        }

        return this.mapUserToResponse("user data updated successfully", updateData)
  }

  async getAllFeedback (req: Request): Promise<MapResponse>{
    const page = parseInt(req.query.page as string) || 1;
    const batchSize = parseInt(req.query.batchSize as string) || 50;

    const skip: number = (Math.ceil(page/5)-1)*batchSize;

    const data = await this.repository.findDataWithBatchPagination<IFeedback>(FeedbackModel,
      {},
      page,
      batchSize,
         {
             projection:{
                 _v:0,
                 archive:0
             },
             sort: {isAccept:1, createdAt: -1},
             lean: true,
             skip
         }
    );

    if(!data){
      throw new CustomError("User's feedback data not found", 404)
    }

    return this.mapUserToResponse("User's feedback data listed successfully",data);
  }

  async addFeedback (req: Request): Promise<MapResponse>{
    const id = this.checkValidTokenId(req.user);
    
    const {category, description} = req.body;

    const data: IFeedback = {
      userId:id,
      category,
      description,
      date: new Date(),
    } as IFeedback

    const userData = await this.repository.createFeedback(data);

    return this.mapUserToResponse("User feedback added successfully")

  }

  async registerProfile(req: Request): Promise<MapResponse>{
    const data  = req.body as Partial<RegisterProfile>;
 
    const files = req.files as Express.Multer.File[];

    let uploadImageUrl: string | undefined;
  
    const _id = req.user?._id;

    if (!_id) {
      throw new CustomError("User _id is required",400);
    }


   if(files && files.length > 0){
    try {
      const uploadResults = await uploadFile(files[0],"user/");
      uploadImageUrl = uploadResults.url;
    } catch (error) {
      throw new CustomError("Image upload failed", 500);
    }
   }

    const finalImageUrl = uploadImageUrl || data?.imageUrl;
    
    await this.repository.registerProfile(finalImageUrl, _id, data ); 
    return this.mapUserToResponse("Profile updated successfully");
  }

  async getProfile(req: Request): Promise<MapResponse>{
    const id = this.checkValidTokenId(req.user);

    const data = await this.repository.findWithId(id);

    if(!data){
      throw new CustomError("User not found", 404)
    }

    return this.mapUserToResponse("User profile listed successfully",data);
    
  }
}
