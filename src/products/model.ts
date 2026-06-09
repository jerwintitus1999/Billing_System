import mongoose from "mongoose";
import { createSchema } from "../database/createSchema";
import { ProductsType } from "./type";

const PriceHistorySchema = new mongoose.Schema(
  {
    price: { type: Number, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const productsSchema = createSchema<ProductsType>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  priceHistory: { type: [PriceHistorySchema], default: [] },
} as any);

export default mongoose.model<ProductsType>("Products", productsSchema);