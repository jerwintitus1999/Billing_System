import { ValidationSchema } from "./types";
import { SchemaFieldBuilder } from "./schemaField";
import { Schema } from "mongoose";

const schemaCache = new Map<string, ValidationSchema>();

export const globalSchema: ValidationSchema = {
  id: new SchemaFieldBuilder(String)
    .match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
    .build(),
  createdBy: new SchemaFieldBuilder(String).required().index().build(),
  active: new SchemaFieldBuilder(Boolean).default(true).build(),
  archive: new SchemaFieldBuilder(Boolean).default(false).build(),
  page: new SchemaFieldBuilder(Number).min(1).default(1).build(),
  limit: new SchemaFieldBuilder(Number).min(1).max(100).default(10).build(),

  _id: new SchemaFieldBuilder(String)
    .required()
    .match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
    .build(),
  userName: new SchemaFieldBuilder(String).required().build(),
  email: new SchemaFieldBuilder(String).required().index().lowercase().trim().build(),
  userId: new SchemaFieldBuilder(String).required().build(),
  role: new SchemaFieldBuilder(String)
    .required()
    .enum(["super", "doctor", "user"])
    .default("user")
    .build(),
  mobile: new SchemaFieldBuilder(Number).required().index().build(),
  imageUrl: new SchemaFieldBuilder(String).build(),
  bio: new SchemaFieldBuilder(String).trim().build(),
  gender: new SchemaFieldBuilder(String)
    .required()
    .enum(["male", "female", "other"])
    .default("other")
    .build(),
  dob: new SchemaFieldBuilder(Date).build(),
  otp: new SchemaFieldBuilder(String).match(/^[0-9]{6}$/).build(), //Change the count of numbers based on what should be present in the generated OTP.
  otpExpiresAt: new SchemaFieldBuilder(Date).build(),
  password: new SchemaFieldBuilder(String).min(3).max(15).build(),
  description: new SchemaFieldBuilder(String).min(5).build(),
  permissions: new SchemaFieldBuilder(Array).build()
};

export function getFields(fields: string[]): ValidationSchema {
  const cacheKey = fields.sort().join(",");

  if (schemaCache.has(cacheKey)) {
    return schemaCache.get(cacheKey)!;
  }

  const schema = fields.reduce((acc, field) => {
    if (globalSchema[field]) {
      acc[field] = { ...globalSchema[field] };
    }
    return acc;
  }, {} as ValidationSchema);

  schemaCache.set(cacheKey, schema);
  return schema;
}
