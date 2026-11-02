import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { TtlCache } from "../../utils/cache.ts";

// Must be set before app/env modules are loaded.
process.env.DELAY_MIN_MS = "0";
process.env.DELAY_MAX_MS = "0";

const { createApp } = await import("../../app.ts");
const productsService = await import("./products.service.ts");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

test("cache: entry expires after TTL and factory runs again", async () => {
  let factoryCalls = 0;
  const cache = new TtlCache(20);
  const factory = async () => {
    factoryCalls += 1;
    return "value";
  };

  await cache.getOrSet("k", factory);
  await cache.getOrSet("k", factory);
  assert.equal(factoryCalls, 1);

  await sleep(40);
  const value = await cache.getOrSet("k", factory);
  assert.equal(factoryCalls, 2);
  assert.equal(value, "value");
});

test("single-flight: 50 concurrent cold-cache calls share one factory run", async () => {
  let factoryCalls = 0;
  const cache = new TtlCache(10_000);
  const factory = async () => {
    factoryCalls += 1;
    await sleep(10); // still in flight when the other 49 calls arrive
    return "value";
  };

  const results = await Promise.all(
    Array.from({ length: 50 }, () => cache.getOrSet("k", factory)),
  );

  assert.equal(factoryCalls, 1);
  for (const result of results) {
    assert.equal(result, "value");
  }
});

test("service: pagination, filter and search", async () => {
  const page = await productsService.listProducts({ page: 1 });
  assert.equal(page.items.length, 10);
  assert.equal(page.total, 100);
  assert.equal(page.totalPages, 10);

  const electronics = await productsService.listProducts({
    category: "electronics",
    page: 1,
  });
  assert.ok(electronics.total > 0);
  assert.ok(electronics.total < 100);
  assert.ok(electronics.items.every((p) => p.category === "electronics"));
});

test("PATCH invalidates the product and list cache entries", async () => {
  const before = await productsService.getProductById(5);
  await productsService.listProducts({ page: 1 }); // warm the list cache

  const updated = await productsService.updateProduct(5, {
    name: "Renamed Product",
  });
  assert.equal(updated.name, "Renamed Product");
  assert.equal(updated.description, before.description);

  // Same queries within TTL must see the change (cache was invalidated).
  const after = await productsService.getProductById(5);
  assert.equal(after.name, "Renamed Product");

  const list = await productsService.listProducts({ q: "renamed", page: 1 });
  assert.equal(list.total, 1);
  assert.equal(list.items[0]!.id, 5);
});

test("getPrice returns randomized values and 404s for unknown ids", async () => {
  const price = await productsService.getProductPrice(1);
  assert.equal(price.id, 1);
  assert.ok(price.price > 0);
  assert.ok(Number.isInteger(price.stock));

  await assert.rejects(
    () => productsService.getProductPrice(9999),
    (err: unknown) =>
      typeof err === "object" &&
      err !== null &&
      (err as { statusCode?: number }).statusCode === 404,
  );
});

test("http: validation, 404 and PATCH flow end to end", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((r) => server.once("listening", r));
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;

  const badQuery = await fetch(`${base}/api/products?page=abc`);
  assert.equal(badQuery.status, 400);

  const missing = await fetch(`${base}/api/products/4242`);
  assert.equal(missing.status, 404);

  const badId = await fetch(`${base}/api/products/not-a-number`);
  assert.equal(badId.status, 400);

  const emptyPatch = await fetch(`${base}/api/products/3`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(emptyPatch.status, 400);

  const patch = await fetch(`${base}/api/products/3`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ description: "Updated via http" }),
  });
  assert.equal(patch.status, 200);

  const product = await fetch(`${base}/api/products/3`).then((r) => r.json());
  assert.equal(product.description, "Updated via http");

  const unknownRoute = await fetch(`${base}/api/nope`);
  assert.equal(unknownRoute.status, 404);
});

test("http: 50 concurrent identical requests on cold cache all succeed", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((r) => server.once("listening", r));
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;

  const responses = await Promise.all(
    Array.from({ length: 50 }, () => fetch(`${base}/api/products?page=2`)),
  );

  let firstBody: string | null = null;
  for (const res of responses) {
    assert.equal(res.status, 200);
    const body = await res.text();
    firstBody ??= body;
    assert.equal(body, firstBody);
  }
});
