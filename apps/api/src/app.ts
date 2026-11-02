import express, { type Express, type Request, type Response } from "express";
import { delay } from "./middleware/delay.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { notFound } from "./middleware/not-found.ts";
import { productsRouter } from "./modules/products/products.routes.ts";

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.use("/api/products", delay, productsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
