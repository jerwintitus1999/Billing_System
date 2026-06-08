import { Repository } from "./repository";
import { CustomError } from "../utils/customError";
import {
  AdminAuthTokens,
  CreateEnhance,
  CreateResponse,
  IModel,
  AdminLoginCredentials,
  PaginatedResponse,
  AdminRefreshPayload,
  AdminTokenPayload,
  CreateSuperAdmin,
  GetSuperAdmin,
  UpdateSuperAdmin,
  MapResponse,
} from "./type";
import { query, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRequestData } from "../middleware/auth";
import { processAndUploadFiles } from "../utils/s3Client";
import envConfig from "../config/env";
export class Service {
  private repository = new Repository();
  private readonly SALT_ROUNDS = 12;

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private async checkValidPassword(providedPassword:string, storedPassword:string): Promise<boolean> {
    return await bcrypt.compare(providedPassword, storedPassword);
  }
  

  // private mapUserToResponse(user: any): CreateResponse {
  //   return {
  //     _id: user._id,
  //     userName: user.userName,
  //     email: user.email,
  //     mobile: user.mobile,
  //     imageUrl: user.imageUrl,
  //     description: user.description,
  //     role: user.role,
  //     active: user.active,
  //     permissions: user.permissions,
  //   };
  // };

  private mapUserToResponse(message:string, data?:any): MapResponse{
      return {
          message,
          data
      }
  }

  private generateTokens(data: AdminTokenPayload): AdminAuthTokens {
        const accessAdminTokenPayload = { ...data, type: "access" } as AdminTokenPayload;
        const accessToken = jwt.sign(accessAdminTokenPayload, envConfig.jwt.accesssecret, 
        //   {
        //   expiresIn: envConfig.jwt.accessExpirationMinutes,
        // }
      );
    
        const refreshAdminTokenPayload = { userId: data._id, type: "refresh" } as AdminRefreshPayload;
        const refreshToken = jwt.sign(refreshAdminTokenPayload, envConfig.jwt.refreshsecret, {
          expiresIn: envConfig.jwt.refreshExpirationDays,
        });
    
        return { accessToken, refreshToken };
      }

  
  async login(req: Request): Promise<AdminAuthTokens>{
   
      const credentials: AdminLoginCredentials = req.body;
      const {userName} = req.body;
      if(!credentials.email || !credentials.password){
        throw new CustomError("Email or password required", 400);
      }

      const superAdmin = await this.repository.findExistence();
      if(!superAdmin) {
        const hashedPassword = await this.hashPassword(credentials.password)
        await this.repository.createSuper({email:credentials.email, password:hashedPassword, userName: userName ?? 'Super Admin', role:'super'});

        throw new CustomError("Super admin created. Please login again.", 201);
      }else {
         const isVaild = await this.checkValidPassword(credentials.password, superAdmin.password );
  
      if(!isVaild){
        throw new CustomError("Wrong password. Please give correct password", 400)
      }
  

      const payload: AdminTokenPayload = {
          _id: superAdmin._id,
          userName: superAdmin.userName,
          email: superAdmin.email,
          role: superAdmin.role,
          type: "access",
        }
      
      return this.generateTokens(payload);
      }
    }

  async getSuperAdmin(req: Request): Promise<GetSuperAdmin>{
  const {user} = req;

  if (!user || !user._id) {
    throw new CustomError("Unauthorized or missing super admin", 401);
  }
    const getData = await this.repository.findWithId(user?._id);

    if(!getData){
      throw new CustomError("Invalid super admin",401)
    }

    return getData;
  }

  async updateAdmin(req: Request) : Promise<MapResponse>{
    const {user, body:{userName, email, password}} = req;

    if (!user || !user._id) {
    throw new CustomError("Unauthorized or missing super admin", 401);
    }

  
    const data = {
      ...(userName && {userName} ),
      ...(email && {email} ),
      ...(password && { password: await this.hashPassword(password) })
    }


    const updateData = await this.repository.updateData(user._id, data  );

    if(!updateData){
      throw new CustomError("Admin not found", 404);
    }

    return this.mapUserToResponse("Admin data updated",updateData);
  }



  async createAdmin(req: Request): Promise<MapResponse> {


    const { userName, email, mobile, password, permissions, description} = req.body;

    const roleAccess = req.user?.role;
    
    if(roleAccess !== 'super'){
      throw new CustomError("Only super admin can create an admin", 401)
    }

    const userId = req.user?._id;
    if(!userId){
      throw new CustomError("userid is not defined", 400)
    }
    // console.log("Re", req.body)

    const files = req.files;

    // console.log("file", files)


    const emailCheckPromise = this.repository.findByEmail(email);
    const uniqueIdPromise = Promise.resolve(uuidv4());
    const passwordHashPromise = this.hashPassword(password);
    const fileUploadPromise = files
      ? processAndUploadFiles(files as Express.Multer.File[], "admins")
      : Promise.resolve([]);
 
    // console.log("email", emailExists, "uniq", uniqueId, "hash", hashedPassword, "upl", uploadResults)

    const [emailExists, hashedPassword, uploadResults, uniqueId] =
      await Promise.all([
        emailCheckPromise,
        passwordHashPromise,
        fileUploadPromise,
        uniqueIdPromise
      ]);

    if (emailExists) {
      throw new CustomError("Email already exists", 409);
    }

    const imageUrl = uploadResults.length > 0 ? uploadResults[0].url : "";
    const createdBy = userId ?? "unknown";

    // console.log("result", imageUrl,  uniqueId, email, hashedPassword, mobile, createdBy)

    const enhancedUserData: CreateEnhance = {
      _id: uniqueId,
      userName,
      email,
      password:hashedPassword,
      mobile,
      imageUrl,
      description,
      permissions,
      role: "admin",
      createdBy,
    };

    const savedUser = await  this.repository.createUser(enhancedUserData);

    return this.mapUserToResponse("Admin created successfully",savedUser);
  }

  async get(req: Request): Promise<PaginatedResponse<MapResponse>> {
    const { user, query } = req;
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;

    const userData = user as UserRequestData | undefined;
    if (!userData?._id) {
      throw new CustomError("Unauthorized", 401);
    }

    const result = await this.repository.findWithPagination(
      {  },
      page,
      limit,
      {
        projection: {
          password: 0,
          __v: 0,
          archive: 0,
        },
        sort: { createdAt: -1 },
        lean: true,
      }
    );

    return {
      data: result.data.map((user) => this.mapUserToResponse("Admin data listed successfully",user)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }


  async update(req: Request): Promise<MapResponse> {
    const {
      body: updateData,
      query: { _id },
      user,
      files
    } = req;
    const userData = user as UserRequestData | undefined;
   
    if (!userData?._id) {
      throw new CustomError("Unauthorized", 401);
    }

    if (typeof _id !== 'string') {
      throw new CustomError("Invalid ID", 400);
    }

    if (updateData.email) {
      const emailExists = await this.repository.findByEmail(updateData.email);
      if (emailExists) {
        throw new CustomError("Email already exists", 409);
      }
    }

    if(!files || Array.isArray(files) && files.length === 0){
      const existAdmin = await this.repository.findUsingId({_id});
      updateData.imageUrl = existAdmin?.imageUrl;
    }else{
      const fileUpload = await processAndUploadFiles(files as Express.Multer.File[], "admins/");
      updateData.imageUrl = fileUpload.length > 0 ? fileUpload[0].url : "";
    }
  

    const updatedUser = await this.repository.findOneAndUpdate(
      { _id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new CustomError("User not found or unauthorized", 404);
    }

    return this.mapUserToResponse("Admin updated successfully",updatedUser);
  }
}


  