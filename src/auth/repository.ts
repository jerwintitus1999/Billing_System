import { CustomError } from "../utils/customError";
import { BaseRepository } from "../repositories/baseRepository";
import { AuthModel, FeedbackModel } from "./model";
import { IAuth, IFeedback } from "./type";
import { v4 as uuidv4 } from 'uuid';
import { FilterQuery, Model, ProjectionType, SortOrder } from "mongoose";

export class Repository extends BaseRepository<IAuth> {
  private feedbackRepo: Model<IFeedback>
  constructor() {
    super(AuthModel);
    this.feedbackRepo = FeedbackModel;
  }

//otp functionalities

  async saveOtp(userId: string, otp: string): Promise<IAuth> {
    console.log("check")
    return this.update(userId, {
    //  {
        otp,
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      // },
    },{new:true, upsert:true}) as Promise<IAuth>;
  }


  async checkValidOtp(providedOtp:string, storedOtp: string, otpExpiresAt:Date): Promise<boolean>{
    if(!providedOtp) throw new CustomError('otp is required',400);

    if(!storedOtp || storedOtp.trim() !== providedOtp.trim()){
      throw new CustomError("Please enter valid otp", 400)
    }
    const now = new Date();
    if(now > otpExpiresAt){
      throw new CustomError('otp expired. Please enter valid otp', 400)
    };
    return true;
  }

  async removeOtp(_id:string , otp:string | null): Promise<void> {
    
    await this.update(_id, {otp: null}, {new: true} ) 
  }

  //create
  
  async createNewUser(userName: string, mobile: string): Promise<IAuth> {
  const newUser = {
    userName,
    mobile,
    role: 'user',
    userId: uuidv4()
  };
  return this.create(newUser) as Promise<IAuth>;
  }

  async createFeedback(data: IFeedback): Promise<IFeedback> {
  return this.feedbackRepo.create(data);
  }

  //find

  async findByMobile(mobile: string): Promise<IAuth | null> {
    return this.findOne({ mobile }) as Promise<IAuth | null>;
  }

  async findWithId(id:string): Promise<IAuth | null> {
    return this.findById(id,{userName:1, email:1, mobile:1, gender:1, walletBalance:1, languages:1, bio:1, imageUrl:1})
  }

  async findDataWithPagination(
      filter: FilterQuery<IAuth>,
      page: number = 1,
      limit: number = 10,
      options?: {
        sort?: { [key: string]: SortOrder };
        projection?: ProjectionType<IAuth>;
        lean?: boolean;
        skip?:number
      }
    ) {
      return this.findWithPagination(filter, page, limit, options);
    }


     async findDataWithBatchPagination<T>(
      model: Model<T>,
      filter: FilterQuery<T>,
      page: number = 1,
      limit: number = 10,
      options?: {
        sort?: { [key: string]: SortOrder };
        projection?: ProjectionType<IAuth>;
        lean?: boolean;
        skip?:number
      }
    ) : Promise<{
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}>{

      return this.findBatchWithPagination(model,filter, page, limit, options);
    }

  //update

  async registerProfile( imageUrl: string | undefined, _id:string, data: any) : Promise<IAuth>{
    const userData = {
      ...data,
      ...(imageUrl && {imageUrl}),
    }

    return this.findOneAndUpdate({_id}, userData, {upsert:true}) as Promise<IAuth>;
  }

  async findWithIdAndUpdate (id: string, data:any): Promise<IAuth | null>{
      return this.update(id, data, {new: true})
  }  
}