import { Request, Response } from "express";
import { Service } from "./service";
import { asyncHandler } from "../utils/asyncHandler";

export class Controller {
  private service: Service;

  constructor() {
    this.service = new Service();
  }


  login = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.login(req);
    res.status(200).json(data);
  });

  
  //superAdmin data
  getSuperAdmin = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.getSuperAdmin(req);
    res.status(200).json(data);
  });

  updateSuperAdmin = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.updateAdmin(req);
    res.status(200).json(data);
  })

  createAdmin = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.createAdmin(req);
    res.status(201).json(data);
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.get(req);
    res.status(200).json(data);
  });

  updateAdmin = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.update(req);
    res.status(200).json(data);
  });
}
