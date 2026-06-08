import { SchemaFieldBuilder } from "../validation/schemaField";
import { getFields } from "../validation/globalSchema";
import { optional, required } from "joi";

const defaultSchemaFields = getFields([
  "userName",
  "mobile",
  "dob",
  "userId",
  "gender",
  "bio",
  "imageUrl",
  "role",
  "otp",
  "otpExpiresAt",
]);

export const schemaFields = {
  ...defaultSchemaFields,

  email: new SchemaFieldBuilder(String).lowercase().trim().build(),
  active: new SchemaFieldBuilder(Boolean).default(false).build(),
  walletBalance: new SchemaFieldBuilder(Number).min(0).default(0).build(),
  languages: new SchemaFieldBuilder(Array).build(),
  isAccept: new SchemaFieldBuilder(Boolean).default(false).build(),

}

export const feedbackFields = {
  userId: new SchemaFieldBuilder(String).required().build(),
  category: new SchemaFieldBuilder(String).enum([
    "crying", "disappointed", "expressionless","humble", "heartEye"
  ]).required().build(),
  description: new SchemaFieldBuilder(String).min(5).build(),
  date: new SchemaFieldBuilder(Date).default(new Date()).required().build(),
  ...getFields([
    "active",
    "archive"
  ])

}

const requestOtp = getFields(["userName", "mobile"]);

const verifyOtp = getFields(["mobile", "otp"]);

const payloadFields = getFields(["mobile", "otp"]);

const registerProfile = {
  ...schemaFields,
  role: new SchemaFieldBuilder(String)
  .enum(["super", "doctor", "user"])
  .default("user")
  .build(),
  userId: new SchemaFieldBuilder(String).build(),
}




const user_idParams = getFields([
  "_id"
])

const batchWisePagination = {
  page:{type:String},
  batchSize:{type:String}
}

const feedbackPayload = {
  category:{type: String, required:true, enum:[
    "crying", "disappointed", "expressionless","humble", "heartEye"
  ]},
  description:{type:String, min:5, optional:true}
}

export const Validation = {
  requestOtp,
  verifyOtp,
  payloadFields,
  registerProfile,
  user_idParams,
  batchWisePagination,

  feedbackPayload
};
