import express from "express";
import cors from "cors";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import mongoose from "mongoose";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { successHandler, errorHandler } from "./middleware/morgan";
import routes from "./routes";
import envConfig from "./config/env";
import logger from "./utils/logger";

// Connect to MongoDB
const MONGODB_URI = envConfig.mongoose.url;
if (mongoose.connection.readyState === 0) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      logger.info("Connected to MongoDB");
    })
    .catch((error) => {
      logger.error("Error connecting to MongoDB:", error);
    });
}

const app = express();
const server = new HTTPServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(successHandler);
app.use(errorHandler);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v1", routes);

app.use(globalErrorHandler);

app.use("/", (req, res) => {
  res.send("api not found");
});

export { server, io };
export default app;