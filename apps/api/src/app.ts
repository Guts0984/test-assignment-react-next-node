import express, { type Express, type Request, type Response } from "express";
import { errorHandler } from "./middleware/error-handler.ts";
import { notFound } from "./middleware/not-found.ts";
import { createProductsRateLimiter } from "./middleware/rate-limit.ts";
import { productsRouter } from "./modules/products/products.routes.ts";

export function createApp(): Express {
  const app = express();

  app.set("trust proxy", "loopback, uniquelocal");

  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/api/products", createProductsRateLimiter(), productsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
