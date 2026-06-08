import { Request, Response } from "express";
import { Service } from "./service";
import { asyncHandler } from "../utils/asyncHandler";
import envConfig from "../config/env";

export class Controller {
  private service = new Service();

  requestOtp = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.requestOtp(req);
    res.status(200).json(result);
  });

  // verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  //   const tokens = await this.service.verifyOtp(req);
  //   res.cookie("refreshToken", tokens.refreshToken, envConfig.cookies);
  //   res.status(200).json({ accessToken: tokens.accessToken });
  // });

  login = asyncHandler(async (req:Request, res: Response)=>{
    const result = await this .service.login(req);
    res.status(200).json(result);
  })


  getAllUserData = asyncHandler(async (req:Request, res: Response) => {
    const result = await this.service.getAllUserData(req);
    res.status(200).json(result);
  })

  updateAllUserData = asyncHandler(async (req:Request, res: Response) => {
    const result = await this.service.updateAllUserData(req);
    res.status(200).json(result);
  })


  getAllFeedback = asyncHandler(async (req:Request, res:Response) => {
    const result = await this.service.getAllFeedback(req);
    res.status(200).json(result);
  })


  addFeedback = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.addFeedback(req);
    res.status(200).json(result);
  })


  registerProfile = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.registerProfile(req);
    res.status(200).json(result);
  })

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.getProfile(req);
    res.status(200).json(result);
  })
}
