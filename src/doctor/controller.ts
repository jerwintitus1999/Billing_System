import { Request, Response } from "express";
import { Service } from "./service";
import { asyncHandler } from "../utils/asyncHandler";

export class Controller{
    private service: Service;

    constructor(){
        this.service = new Service();
    }

    Register = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.Register(req)
        res.status(201).json(data);
    });

    getAllDoctorData = asyncHandler(async (req: Request, res: Response) => {
       const data = await this.service.getAllDoctorData(req);
       res.status(200).json(data);
     });

    updateDoctorData = asyncHandler(async (req: Request, res: Response) => {
        const data = await this.service.updateDoctorData(req);
        res.status(200).json(data);
    })
}