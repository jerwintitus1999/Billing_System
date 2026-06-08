import { getFields } from "../validation/globalSchema";

const payloadFields = getFields([
  "email",
  "userName",
  "password",
  "imageUrl"
]);

export const schemaFields = {
  ...payloadFields,
  ...getFields([
    "role",
    "active",
    "archive",
  ]),
// mobile: {type: String}
};

// console.log(schemaFields);

export const loginFields = {
  userName:{type:String, required: false},
   ...getFields([
  "email",
  "password"
])
}

export const updateCredentials = {
  ...getFields([
    "userName",
    "email",
    "password"
  ])
}

export const limits = {
  page:{type:String},
  limit:{type:String}
}

export const _id = getFields([
  "_id"
])

export const Validation = {
  body: payloadFields,
  loginFields,
  updateCredentials,
  limits,
  _id
};
