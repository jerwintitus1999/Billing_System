import express, { Router } from "express";
import fs from "fs";
import path from "path";
import logger from "../utils/logger";

const router: Router = express.Router();
const routesDir: string = path.join(__dirname, "..");

fs.readdirSync(routesDir).forEach(async (file: string) => {
  const routePath: string = path.join(routesDir, file, "route.ts");

  try {
    if (fs.existsSync(routePath)) {
      const module = await import(routePath);
      if (module.default && typeof module.default === "function") {
        router.use(`/${file}`, module.default);
      } else {
        logger.info(
          `Skipped loading ${routePath}: Not a valid Express router.`
        );
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Error loading route at ${routePath}: ${error.message}`);
      logger.warn(error.stack || "No stack trace available.");
    }
  }
});

export default router;
