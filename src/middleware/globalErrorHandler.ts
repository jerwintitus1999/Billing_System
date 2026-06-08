import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import logger from "../utils/logger";
import { CustomError } from "../utils/customError";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.errorMessage = err.message;

  if (err instanceof CustomError) {
    logger.error(`CustomError: ${err.stack}`);
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    logger.error(`MongoError: ${err.message}`);
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      status: "error",
      message: `Validation Error:`,
      errors,
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    logger.error("Cast Error:", {
      value: err.value,
      path: err.path,
      kind: err.kind,
    });

    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    logger.error("Duplicate Key Error:", {
      field,
      value: (err as any).keyValue[field],
    });

    return res.status(409).json({
      status: "error",
      message: `Duplicate value for ${field}`,
      field,
    });
  }

  logger.error("Unhandled Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
};
