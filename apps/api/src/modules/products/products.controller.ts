import type { Request, Response } from "express";
import * as productsService from "./products.service.ts";
import {
  listQuerySchema,
  productIdSchema,
  updateProductSchema,
} from "./products.schemas.ts";

export async function list(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query);
  res.json(await productsService.listProducts(query));
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = productIdSchema.parse(req.params.id);
  res.json(await productsService.getProductById(id));
}

export async function getPrice(req: Request, res: Response): Promise<void> {
  const id = productIdSchema.parse(req.params.id);
  res.json(await productsService.getProductPrice(id));
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = productIdSchema.parse(req.params.id);
  const data = updateProductSchema.parse(req.body);
  res.json(await productsService.updateProduct(id, data));
}
