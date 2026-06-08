import { Request, Response, NextFunction } from "express";
import {
  RequestValidationSchema,
  ValidationSource,
  ValidationError,
} from "../validation/types";
import { buildJoiSchema } from "../validation/joiSchemaBuilder";
import httpStatus from "http-status";
import { CustomError } from "../utils/customError";

export function validateSchema(schema: RequestValidationSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const isPutMethod = req.method === "PUT";
    const errors: ValidationError[] = [];

    try {

      await Promise.all(
        Object.entries(schema).map(async ([source, validationSchema]) => {
          if (!validationSchema) return;

          const joiSchema = buildJoiSchema(validationSchema, isPutMethod);
          const { error } = joiSchema.validate(
            req[source as ValidationSource],
            {
              abortEarly: false,       
            }
          );
          console.log("error", error)
          if (error) {
            console.log("error", error)
            errors.push(
              ...error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message.replace(/["]/g, ""),
                source: source as ValidationSource,
              }))
            );
          }
        })
      );

      if (errors.length > 0) {
        console.log("error2", errors)
        if (errors.length === 1) {
          throw new CustomError(
            errors[0].message,
            httpStatus.BAD_REQUEST,
            errors
          );
        } else {
          console.log("error3", errors)
          const formattedMessage = errors
            .map(
              (error) =>
                error.message.charAt(0).toUpperCase() + error.message.slice(1)
            )
            .join(", ");
          throw new CustomError(
            formattedMessage,
            httpStatus.BAD_REQUEST,
            errors
          );
        }
      }

      next();
    } catch (error) {
      console.log("error4", error)
      next(error);
    }
  };
}
