import { createApp } from "./app";
import logger from "./utils/logger";
import mongoose from "mongoose";
import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import envConfig from "./config/env";

const port = envConfig.port || 4000;
const MONGODB_URI = envConfig.mongoose.url;

let serverInstance: Server | null = null;
let io: SocketIOServer | null = null;
let serverStarted = false;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB");

    if (!serverStarted) {
      const { server, io: socketIO } = createApp();
      io = socketIO;
      serverInstance = server.listen(port, () => {
        serverStarted = true;
        logger.info("Socket.IO server initialized");
        logger.info(`Server is running on port ${port}`);
      });
    }
  })
  .catch((error) => {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

const gracefulShutdown = async () => {
  try {
    if (serverInstance) {
      await new Promise<void>((resolve) => {
        serverInstance?.close(() => {
          logger.info("HTTP server closed");
          resolve();
        });
      });
    }

    if (io) {
      await new Promise<void>((resolve) => {
        io?.close(() => {
          logger.info("Socket.IO server closed");
          resolve();
        });
      });
    }

    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error) => {
  logger.error("Unexpected error:", error);
  gracefulShutdown();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  gracefulShutdown();
});

process.on("SIGINT", () => {
  logger.info("SIGINT received");
  gracefulShutdown();
});