import { Repository } from "./repository";
import { CustomError } from "../utils/customError";
import { Request } from "express";
import { ProductsType, MapResponse } from "./type";

export class Service {
  private repository = new Repository();

  private mapToResponse(message: string, data?: any): MapResponse {
    return {
      message,
      data,
    };
  }

  async createProduct(req: Request): Promise<MapResponse> {
    const { name, price, date } = req.body;
    const initialDate = date ? new Date(date) : new Date();

    const exists = await this.repository.findByName(name);
    if (exists) {
      throw new CustomError("Product with this name already exists", 400);
    }

    const newProduct = await this.repository.create({
      name,
      price,
      priceHistory: [
        {
          price,
          changedAt: initialDate,
        },
      ],
      createdAt: initialDate,
    } as any);

    if (!newProduct) {
      throw new CustomError("Failed to create product", 500);
    }

    return this.mapToResponse("Product successfully created", newProduct);
  }

  async getAllProducts(req: Request): Promise<MapResponse> {
    const products = await this.repository.find({}, undefined, { lean: true });
    return this.mapToResponse("Products retrieved successfully", products);
  }

  async getProductById(req: Request): Promise<MapResponse> {
    const id = (req.params.id || req.query.id) as string;
    if (!id) {
      throw new CustomError("Product ID is required", 400);
    }

    const product = await this.repository.findById(id);
    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    return this.mapToResponse("Product retrieved successfully", product);
  }

  async updateProduct(req: Request): Promise<MapResponse> {
    const id = (req.params.id || req.query.id) as string;
    if (!id) {
      throw new CustomError("Product ID is required", 400);
    }

    const { name, price, date } = req.body;
    const effectiveDate = date ? new Date(date) : new Date();

    const product = await this.repository.findById(id);
    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    if (name && name !== product.name) {
      const exists = await this.repository.findByName(name);
      if (exists && exists._id !== product._id) {
        throw new CustomError("Product with this name already exists", 400);
      }
      product.name = name;
    }

    if (price !== undefined && price !== product.price) {
      product.priceHistory.push({
        price,
        changedAt: effectiveDate,
      });
      product.price = price;
    } else if (date && product.priceHistory.length > 0) {
      product.priceHistory[product.priceHistory.length - 1].changedAt = effectiveDate;
    }

    const updatedProduct = await product.save();

    return this.mapToResponse("Product updated successfully", updatedProduct);
  }

  async deleteProduct(req: Request): Promise<MapResponse> {
    const id = (req.params.id || req.query.id) as string;
    if (!id) {
      throw new CustomError("Product ID is required", 400);
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new CustomError("Product not found or delete failed", 404);
    }

    return this.mapToResponse("Product deleted successfully", deleted);
  }

  async getPriceHistory(req: Request): Promise<MapResponse> {
    const id = (req.params.id || req.query.id) as string;
    if (!id) {
      throw new CustomError("Product ID is required", 400);
    }

    const product = await this.repository.findById(id);
    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    return this.mapToResponse(
      "Price history retrieved successfully",
      product.priceHistory
    );
  }
}

