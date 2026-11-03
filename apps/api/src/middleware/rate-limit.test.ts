import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";

// Must be set before app/env modules are loaded.
process.env.DELAY_MIN_MS = "0";
process.env.DELAY_MAX_MS = "0";
process.env.RATE_LIMIT_MAX = "5";

const { createApp } = await import("../app.ts");

test("rate limit: returns 429 after exceeding the limit", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((r) => server.once("listening", r));
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;

  let lastStatus = 0;
  for (let i = 0; i < 10; i++) {
    lastStatus = (await fetch(`${base}/api/products?page=1`)).status;
  }
  assert.equal(lastStatus, 429);

  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);
});

test("rate limit: is per client IP when X-Forwarded-For comes from a trusted proxy", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  t.after(() => server.close());
  await new Promise((r) => server.once("listening", r));
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;
  const get = (ip: string) =>
    fetch(`${base}/api/products?page=1`, { headers: { "x-forwarded-for": ip } });

  for (let i = 0; i < 10; i++) await get("203.0.113.1");
  assert.equal((await get("203.0.113.1")).status, 429);
  assert.equal((await get("203.0.113.2")).status, 200);
});
