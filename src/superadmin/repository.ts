import { BaseRepository } from "../repositories/baseRepository";
import { AdminModel } from "./model";
import { AuthModel } from "../auth/model";
import { CreateEnhance, CreateSuperAdmin, GetSuperAdmin, id, IModel, UpdateSuperAdmin } from "./type";
import { IAuth } from "../auth/type";
import { FilterQuery, ProjectionType, SortOrder, UpdateQuery } from "mongoose";

export class Repository {
  private userRepo: BaseRepository<IModel>;
  private authRepo: BaseRepository<IAuth>;

  constructor() {
    this.userRepo = new BaseRepository(AdminModel);
    this.authRepo = new BaseRepository(AuthModel);
  }

  //create

  async createSuper(data: CreateSuperAdmin ): Promise<CreateSuperAdmin> {
   return this.userRepo.create(data);
 }

 async createUser(createData: CreateEnhance): Promise<IModel> {
   return this.userRepo.create(createData);
 }

 //find

  async findExistence(): Promise<IModel | null> {
    const result = await this.userRepo.find({}, undefined, {limit:1});
    return result[0] || null;
  }


  async findWithId(id:string): Promise<GetSuperAdmin | null>{
    return this.userRepo.findById(id,{userName:1, email:1});
  }

  async findByEmail(email: string): Promise<boolean> {
    return this.userRepo.exists({ email: email.toLowerCase() });
  }

  async findWithEmail(email: string): Promise<IModel | null> {
    return this.userRepo.findOne({ email: email.toLowerCase() });
  }

  async findUsingId({_id}:id): Promise<IModel | null> {
    return this.userRepo.findById(_id);
  }

  async findWithPagination(
    filter: FilterQuery<IModel>,
    page: number = 1,
    limit: number = 10,
    options?: {
      sort?: { [key: string]: SortOrder };
      projection?: ProjectionType<IModel>;
      lean?: boolean;
    }
  ) {
    return this.userRepo.findWithPagination(filter, page, limit, options);
  }


  //update
  
  async updateData(id:string , data: UpdateQuery<UpdateSuperAdmin> ): Promise<UpdateSuperAdmin | null>{
    return this.userRepo.update(id, data, {new:true, upsert:true});
  }  


  async findOneAndUpdate(
    filter: FilterQuery<IModel>,
    update: Partial<IModel>,
    options?: { new?: boolean; runValidators?: boolean }
  ): Promise<IModel | null> {
    return this.userRepo.findOneAndUpdate(filter, update, options);
  }
 

}