import { Schema, SchemaDefinition, SchemaOptions } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const createSchema = <T>(
  schemaDefinition: SchemaDefinition<T>,
  options: SchemaOptions = {}
): Schema => {
  const schema = new Schema(
    {
      _id: { type: String, default: uuidv4 }, 
      ...schemaDefinition,
      __v: { type: Number, select: false },
    },
    { timestamps: true, ...options }
  );

  return schema;
};
