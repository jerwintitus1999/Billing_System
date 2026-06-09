import { BaseRepository } from "../repositories/baseRepository";
import ProductsModel from "./model";
import { ProductsType } from "./type";

export class Repository extends BaseRepository<ProductsType> {
  constructor() {
    super(ProductsModel);
  }

  async findByName(name: string): Promise<ProductsType | null> {
    return this.findOne({ name });
  }
}