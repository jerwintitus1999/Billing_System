import mongoose from "mongoose";
import { IModel } from "./type";
import { schemaFields } from "./payload";
import { createSchema } from "../database/createSchema";

const userSchema = createSchema(schemaFields);

export const AdminModel = mongoose.model<IModel>("Admin", userSchema);
