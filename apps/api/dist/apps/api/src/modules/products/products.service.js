import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../../config/env.js";
import { appError } from "../../utils/app-error.js";
import { TtlCache } from "../../utils/cache.js";
export const PAGE_SIZE = 10;
const dataPath = path.resolve(import.meta.dirname, "../../data/products.json");
const cache = new TtlCache(env.cacheTtlMs);
let products = null;
let loadPromise = null;
function ensureLoaded() {
    loadPromise ??= readFile(dataPath, "utf8").then((raw) => {
        products = JSON.parse(raw);
        return products;
    });
    return loadPromise;
}
function findOrFail(all, id) {
    const product = all.find((p) => p.id === id);
    if (!product) {
        throw appError(404, `Product with id ${id} not found`);
    }
    return product;
}
export async function listProducts(query) {
    const key = `list:${JSON.stringify(query)}`;
    return cache.getOrSet(key, async () => {
        const all = await ensureLoaded();
        let filtered = all;
        if (query.category) {
            const category = query.category.toLowerCase();
            filtered = filtered.filter((p) => p.category.toLowerCase() === category);
        }
        if (query.q) {
            const q = query.q.toLowerCase();
            filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q));
        }
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const start = (query.page - 1) * PAGE_SIZE;
        return {
            items: filtered.slice(start, start + PAGE_SIZE),
            page: query.page,
            pageSize: PAGE_SIZE,
            total,
            totalPages,
        };
    });
}
export async function getProductById(id) {
    return cache.getOrSet(`id:${id}`, async () => {
        const all = await ensureLoaded();
        return findOrFail(all, id);
    });
}
/** Never cached — price and stock are randomized on every request. */
export async function getProductPrice(id) {
    const all = await ensureLoaded();
    const product = findOrFail(all, id);
    const price = Math.round(product.price * (0.8 + Math.random() * 0.4) * 100) / 100;
    const stock = Math.floor(Math.random() * 200);
    return { id: product.id, price, stock };
}
export async function updateProduct(id, data) {
    const all = await ensureLoaded();
    const product = findOrFail(all, id);
    if (data.name !== undefined) {
        product.name = data.name;
    }
    if (data.description !== undefined) {
        product.description = data.description;
    }
    cache.delete(`id:${id}`);
    cache.deleteWhere((key) => key.startsWith("list:"));
    return product;
}
