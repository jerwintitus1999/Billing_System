import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import envConfig from "../config/env";
import logger from "./logger";

const s3Client = new S3Client({
  region: envConfig.doSpaces.region,
  endpoint: envConfig.doSpaces.endpoint,
  credentials: {
    accessKeyId: envConfig.doSpaces.accessKeyId,
    secretAccessKey: envConfig.doSpaces.secretAccessKey,
  },
});

const baseUrl = envConfig.doSpaces.spaceUrl;
const defaultFolderPath = envConfig.doSpaces.folderPath;


class ConcurrentQueue {
  private queue: (() => Promise<any>)[] = [];
  private running = 0;
  
  constructor(private concurrency: number) {}

  async add<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.concurrency) {
      await new Promise<void>(resolve => {
        this.queue.push(() => {
          resolve();
          return Promise.resolve();
        });
      });
    }
    
    this.running++;
    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) next();
      }
    }
  }
}

const uploadQueue = new ConcurrentQueue(3);

export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface UploadResult {
  url: string;
  key: string;
  originalName: string;
}

const getFileExtension = (() => {
  const cache = new Map<string, string>();
  return (filename: string): string => {
    if (cache.has(filename)) {
      return cache.get(filename)!;
    }
    const ext = path.extname(filename);
    cache.set(filename, ext);
    return ext;
  };
})();

export const uploadFile = async (
  file: UploadedFile,
  customFolderPath?: string | null
): Promise<UploadResult> => {
  try {
    const fileExtension = getFileExtension(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const folderPath = `${defaultFolderPath}${customFolderPath ?? ''}`;
    const key = `${folderPath}${fileName}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: "facesync",
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      },
      queueSize: 4,
      partSize: 20 * 1024 * 1024, 
      leavePartsOnError: false,
    });

    await upload.done();

    return {
      url: `${baseUrl}${key}`,
      key,
      originalName: file.originalname,
    };
  } catch (error) {
    logger.error("Error uploading file to S3:", error);
    throw new Error(
      `Failed to upload file ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const processAndUploadFiles = async (
  reqFiles: Express.Multer.File[] | undefined,
  customFolderPath?: string | null
): Promise<UploadResult[]> => {
  if (!reqFiles?.length) return [];
  
  const files: UploadedFile[] = reqFiles.map((file) => ({
    originalname: file.originalname,
    buffer: file.buffer,
    mimetype: file.mimetype,
    size: file.size,
  }));
  
  return uploadMultipleFiles(files, customFolderPath);
};

export const uploadMultipleFiles = async (
  files: UploadedFile[],
  customFolderPath?: string | null
): Promise<UploadResult[]> => {
  if (!files?.length) return [];

  try {
    const uploadPromises = files.map(file => 
      uploadQueue.add(() => uploadFile(file, customFolderPath))
    );
    
    return Promise.all(uploadPromises);
  } catch (error) {
    logger.error("Error in bulk upload:", error);
    throw new Error(
      `Failed to upload multiple files: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};