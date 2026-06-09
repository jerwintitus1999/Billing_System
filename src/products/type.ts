import { Document } from "mongoose";

export interface PriceHistoryEntry {
  price: number;
  changedAt: Date;
}

export interface ProductsType extends Document {
  _id: string;
  name: string;
  price: number;
  priceHistory: PriceHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MapResponse {
  message: string;
  data?: any;
}