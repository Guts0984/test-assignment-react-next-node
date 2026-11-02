import * as productsService from "./products.service.js";
import { listQuerySchema, productIdSchema, updateProductSchema, } from "./products.schemas.js";
export async function list(req, res) {
    const query = listQuerySchema.parse(req.query);
    res.json(await productsService.listProducts(query));
}
export async function getById(req, res) {
    const id = productIdSchema.parse(req.params.id);
    res.json(await productsService.getProductById(id));
}
export async function getPrice(req, res) {
    const id = productIdSchema.parse(req.params.id);
    res.json(await productsService.getProductPrice(id));
}
export async function update(req, res) {
    const id = productIdSchema.parse(req.params.id);
    const data = updateProductSchema.parse(req.body);
    res.json(await productsService.updateProduct(id, data));
}
