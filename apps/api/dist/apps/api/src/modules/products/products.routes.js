import { Router } from "express";
import * as productsController from "./products.controller.js";
export const productsRouter = Router();
productsRouter.get("/", productsController.list);
productsRouter.get("/:id", productsController.getById);
productsRouter.get("/:id/price", productsController.getPrice);
productsRouter.patch("/:id", productsController.update);
