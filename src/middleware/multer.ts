import multer, { StorageEngine, MulterError } from "multer";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { CustomError } from "../utils/customError";

interface UploadedFile extends Express.Multer.File {}

interface MulterRequest extends Request {
  files?: Express.Multer.File[];
  uploadedFiles?: Record<string, UploadedFile[]>;
}

const storage: StorageEngine = multer.memoryStorage();
const upload = multer({
  storage,
  // limits: {
  //   fileSize: 5 * 1024 * 1024, // 5MB limit
  //   files: 5 // Maximum 5 files at once
  // },
  // fileFilter: (req, file, cb) => {
  //   const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
  //   if (allowedMimes.includes(file.mimetype)) {
  //     cb(null, true);
  //   } else {
  //     cb(new Error("Invalid file type"));
  //   }
  // },
}).any();

const processFiles = (
  files: Express.Multer.File[]
): Record<string, UploadedFile[]> => {
  return files.reduce((acc, file) => {
    if (file.buffer && file.size > 0) {
      if (!acc[file.fieldname]) {
        acc[file.fieldname] = [];
      }
      acc[file.fieldname].push(file as UploadedFile);
    }
    return acc;
  }, {} as Record<string, UploadedFile[]>);
};

const dynamicUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload(req, res, (err: any) => {
    if (err instanceof MulterError) {
      return next(
        new CustomError(
          `File upload failed: ${err.message}`,
          httpStatus.BAD_REQUEST
        )
      );
    }
    if (err) {
      return next(
        new CustomError(err.message, httpStatus.INTERNAL_SERVER_ERROR)
      );
    }

    const multerReq = req as MulterRequest;

    if (multerReq.files?.length) {
      multerReq.uploadedFiles = processFiles(multerReq.files);
    } else {
      multerReq.uploadedFiles = {};
    }

    next();
  });
};

export default dynamicUpload;
