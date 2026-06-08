import mongoose from "mongoose";
import { IFeedback, IAuth } from "./type";
import { feedbackFields, schemaFields } from "./payload";
import { createSchema } from "../database/createSchema";

const schema = createSchema(schemaFields);
const feedbackSchema = createSchema(feedbackFields);

export const AuthModel = mongoose.model<IAuth>("Auth", schema);
export const FeedbackModel = mongoose.model<IFeedback>("Feedback", feedbackSchema);
