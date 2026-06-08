import { BaseRepository } from "../repositories/baseRepository";
import { CustomError } from "../utils/customError";
import {DoctorModel} from './model';
import { DocModel } from "./type";
import { FilterQuery, ProjectionType, SortOrder } from "mongoose";


export class Repository extends BaseRepository<DocModel>{
    constructor(){
        super(DoctorModel);
    }

    //create
    async createUser (data: Partial<DocModel>): Promise<DocModel | null>{
        return this.create(data);
    }

    //find 
    async findWithMobileOrEmail (mobile:number, email: string, lean = false): Promise<DocModel | null> {
        return this.findOne({$or:[{email}, {mobile}]}, undefined, {lean})
    }

    async findWithIdAndUpdate (id: string, data:any): Promise<DocModel | null>{
        return this.update(id, data, {new: true})
    }

    async findDataWithPagination(
        filter: FilterQuery<DocModel>,
        page: number = 1,
        limit: number = 10,
        options?: {
          sort?: { [key: string]: SortOrder };
          projection?: ProjectionType<DocModel>;
          lean?: boolean;
          skip?:number
        }
      ) {
        return this.findWithPagination(filter, page, limit, options);
      }

}