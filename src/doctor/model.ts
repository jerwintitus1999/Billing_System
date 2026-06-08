import mongoose from "mongoose";
import {DocModel} from "./type";
import {schemaFields} from "./payload";
import { createSchema} from "../database/createSchema";

const doctorSchema = createSchema(schemaFields);

export const DoctorModel = mongoose.model<DocModel>("Doctor",doctorSchema);