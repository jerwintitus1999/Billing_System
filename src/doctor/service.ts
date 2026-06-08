import { Repository } from "./repository";
import { CustomError } from "../utils/customError";
import { Request } from "express";
import { MapResponse, DocModel, PaginatedResponse } from "./type";
import { uploadFile } from "../utils/s3Client";

export class Service{
    private repository = new Repository();

    private mapUserToResponse(message:string, data?:any): MapResponse{
        return {
            message,
            data
        }
    }

    private parseBoolean(value: string): boolean | undefined {
        if(value === 'true') return true;
        if(value === 'false') return false;
        return undefined;
    }

    async Register(req: Request): Promise<MapResponse>{

        const data = req.body as Partial<DocModel>;
        const files = req.files as Express.Multer.File[];

        const {email, mobile} = data;
      
        let imageUrl: string | undefined;

        if(files && files.length > 0 ){
             try {
                  const uploadResults = await uploadFile(files[0],"doctor/");
                  imageUrl = uploadResults.url;
                } catch (error) {
                  throw new CustomError("Image upload failed", 500);
                }
        }
        const existsDoctor= await this.repository.findWithMobileOrEmail(mobile!, email!, true);

        if(existsDoctor){
            throw new CustomError("Email or mobile number already exists", 400)
        }
        const newDoctor= await this.repository.createUser({...data,role:'doctor',imageUrl});
        if(!newDoctor){
            throw new CustomError("Professional not registered. Please try again later.", 500)
        }

        return this.mapUserToResponse("Professional successfully registered");
    }

      async getAllDoctorData (req: Request): Promise<PaginatedResponse<MapResponse>>{
        const {query} = req;
        const isAccepted = this.parseBoolean(req.query.isAccepted as string);
        const page = parseInt(query.page as string) || 1;
        const batchSize = parseInt(query.batchSize as string) || 50;

        const skip:number = (Math.ceil(page/5)-1)*batchSize;
        
        const result = await this.repository.findDataWithPagination(
            {isAccept: isAccepted},
            page,
            batchSize,
            {
                projection:{
                    password:0,
                    _v:0,
                    archive:0
                },
                sort: {createdAt: -1},
                lean: true,
                skip
            }

        );

        return {
            data: result.data.map((doctor) => this.mapUserToResponse("Doctor data listed successfully", doctor)),
            total: result.total,
            page: result.page,
            totalPages: result.totalPages
        }
      }
    

      async  updateDoctorData (req: Request): Promise<MapResponse>{
        const id = req.query.id as string;
        const data = req.body;
        
        if (!id) {
          throw new CustomError("Doctor ID is required in query params", 400);
        }
        
        if(!data){
            throw new CustomError("Update data not provided", 400)
        }
        
        const updateData = await this.repository.findWithIdAndUpdate(id, data);

        if(!updateData){
            throw new CustomError("Doctor not found, update failed", 404)
        }

        return this.mapUserToResponse("Doctor data updated successfully", updateData)
      }

}
