import express, {} from "express";
import { delay } from "./middleware/delay.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { productsRouter } from "./modules/products/products.routes.js";
export function createApp() {
    const app = express();
    app.use(express.json());
    app.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });
    app.use("/api/products", delay, productsRouter);
    app.use(notFound);
    app.use(errorHandler);
    return app;
}
