import { Request, Response } from "express";
import { Service } from "./service";
import { asyncHandler } from "../utils/asyncHandler";

export class Controller {
  private service: Service;

  constructor() {
    this.service = new Service();
  }

  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.createProduct(req);
    res.status(201).json(data);
  });

  getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.getAllProducts(req);
    res.status(200).json(data);
  });

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.getProductById(req);
    res.status(200).json(data);
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.updateProduct(req);
    res.status(200).json(data);
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.deleteProduct(req);
    res.status(200).json(data);
  });

  getPriceHistory = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.getPriceHistory(req);
    res.status(200).json(data);
  });
}