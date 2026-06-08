import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { successHandler, errorHandler } from "./middleware/morgan";
import routes from "./routes";


export const createApp = (): { app: Express; server: HTTPServer; io: SocketIOServer } => {
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

  app.use("/", (req, res)=>{
    res.send("api not found")
  })

  return { app, server, io };
};