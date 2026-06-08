import { getFields } from "../validation/globalSchema";
import { SchemaFieldBuilder } from "../validation/schemaField";

const payloadFields = getFields([
    "userName",
    "email",
    "mobile",
    "imageUrl",
    "gender",
    "password",
    "role",
    "archive" 
])

export const schemaFields = {
    ...payloadFields,

  active: new SchemaFieldBuilder(Boolean).default(false).build(),

  walletBalance: new SchemaFieldBuilder(Number).min(0).default(0).build(),
  isOnline: new SchemaFieldBuilder(Boolean).default(false).build(),

  city: new SchemaFieldBuilder(String).min(2).build(),
  country: new SchemaFieldBuilder(String).min(2).build(),

  personalStatement: new SchemaFieldBuilder(String).min(3).default('Nil').build(),
  experience: new SchemaFieldBuilder(String).min(3).build(),
  about: new SchemaFieldBuilder(String).min(5).build(),
  isAccept: new SchemaFieldBuilder(Boolean).default(false).build(),

  clinicName: new SchemaFieldBuilder(String).min(3).build(),
  clinicDetails: new SchemaFieldBuilder(String).min(5).build(),

  passedOutYear: new SchemaFieldBuilder(String).max(4).build(),
  college: new SchemaFieldBuilder(String).build(),
  profRef: new SchemaFieldBuilder(String).build(),

  bankName: new SchemaFieldBuilder(String).min(2).build(),
  accountNo: new SchemaFieldBuilder(String).trim().unique().match(/^[0-9]{9,18}$/).sparse().build(),
  ifscCode: new SchemaFieldBuilder(String).uppercase().trim().match(/^[A-Z]{4}0[A-Z0-9]{6}$/).sparse().build(),
  aadhaar: new SchemaFieldBuilder(String).trim().unique().match(/^\d{12}$/).sparse().build(),

  languages: new SchemaFieldBuilder(Array).build(),
  specialization: new SchemaFieldBuilder(Array).build(),
  artOfInterest: new SchemaFieldBuilder(Array).build(),
  awardName: new SchemaFieldBuilder(Array).build(),
  memberShip: new SchemaFieldBuilder(String).min(3).build(),

};

const doctorSchema = {
    ...schemaFields,
     role: new SchemaFieldBuilder(String)
    .enum(["super", "doctor", "user"])
    .default("user")
    .build(),
}

const batchWisePagination = {
  isAccepted:{type:String},
  page:{type:String},
  batchSize:{type:String}
}

const queryWithId = {
    id:{type:String}
}

export const Validation = {
    body: doctorSchema,
    batchWisePagination,
    queryWithId
}