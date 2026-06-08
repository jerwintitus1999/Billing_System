const fs = require("fs");
const path = require("path");

const moduleName = process.argv[2];

if (!moduleName) {
  console.log("❌ Please provide module name");
  process.exit(1);
}

const basePath = path.join(
  __dirname,
  "../src",
  moduleName
);

if (fs.existsSync(basePath)) {
  console.log("❌ Module already exists");
  process.exit(1);
}

fs.mkdirSync(basePath, { recursive: true });

const className =
  moduleName.charAt(0).toUpperCase() +
  moduleName.slice(1);

const files = {

  "controller.ts": `
import * as service from "./service";

export const getAll${className} = async (
  req,
  res
) => {
  try {

    const data =
      await service.getAll${className}();

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
`,

  "service.ts": `
import * as repository from "./repository";

export const getAll${className} =
async () => {

  return await repository.getAll${className}();

};
`,

  "repository.ts": `
import ${className}Model from "./model";

export const getAll${className} =
async () => {

  return await ${className}Model.find();

};
`,

  "model.ts": `
import mongoose from "mongoose";

const ${className}Schema =
new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
}
);

export default mongoose.model(
  "${className}",
  ${className}Schema
);
`,

  "route.ts": `
import express from "express";

import * as controller
from "./controller";

const router = express.Router();

router.get(
  "/get-all",
  controller.getAll${className}
);

export default router;
`,

  "payload.ts": `
export interface Create${className}Payload {
  name: string;
}
`,

  "type.ts": `
export interface ${className}Type {
  _id?: string;
  name: string;
}
`,
};

for (const [fileName, content] of Object.entries(files)) {

  fs.writeFileSync(
    path.join(basePath, fileName),
    content.trim()
  );

}

console.log(`✅ Module "${moduleName}" created successfully`);