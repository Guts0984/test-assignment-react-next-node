# Product Catalog (test assignment)

Monorepo: a Node service serves the data, a Next.js app renders it.

```
apps/api         — Express 5 + zod, Node >= 22
apps/web         — Next.js 16 (App Router, Cache Components), React 19, strict TypeScript, Tailwind v4, shadcn-style UI
packages/shared  — shared API response types (imported by both sides, never duplicated)
```

## Run locally

```bash
# 1. API on :3000
cd apps/api
npm install
npm run dev          # native .ts execution in Node (--experimental-strip-types)

# 2. Web on :5432
cd apps/web
npm install
API_URL=http://localhost:3000 npm run dev
```

Environment variables:

| Service | Variable | Default | Purpose |
|---|---|---|---|
| api | `PORT` | `3000` | listen port |
| api | `CACHE_TTL_MS` | `30000` | in-memory cache TTL |
| api | `DELAY_MIN_MS` / `DELAY_MAX_MS` | `500` / `1000` | artificial delay on cache misses and never-cached endpoints (`/price`, `PATCH`); cache hits skip it |
| web | `API_URL` | `http://localhost:3000` | API address; server-only, never leaks into the client bundle |

## Tests

```bash
cd apps/api && npm test        # node:test: TTL cache, single-flight (50 concurrent), HTTP e2e
cd apps/web && npx tsc --noEmit
```

## Production build

**api** — `npm run build` (plain `tsc` → `dist/`), run with `npm run start:dist`.
Rationale: the code is already TS with explicit `.ts` imports and no magic, so `tsc` handles it without bundlers — zero new dependencies, preserved module structure. For dev we keep native `.ts` execution in Node 22+.

**web** — `API_URL=http://localhost:3000 npm run build` → `output: 'standalone'`, run with `node .next/standalone/server.js` (listens on port **5432**).
Important: **the API must be reachable at build time** — the first 20 product page shells are prerendered during `next build`.

## Docker

```bash
docker compose up --build -d   # api on :3000, web on http://localhost:5432
```

The web image is self-contained: since the first 20 product pages are
prerendered during `next build`, the Dockerfile starts the API inside the
build container (with zero artificial delay). No host networking and no
externally started services are needed at build time. At runtime the web
container reaches the API as `http://api:3000` over the compose network.

For a **local** (non-Docker) `npm run build` the API still has to be running
and reachable via `API_URL` — without it the build fails fast with a clear
error.

## API endpoints

Base prefix is `/api` (a documented decision, see below):

- `GET /api/products?category=&q=&page=` — list with filter, search, pagination (10 per page)
- `GET /api/products/:id` — single product, 404 when missing
- `GET /api/products/:id/price` — price and stock, randomized on every request, never cached
- `PATCH /api/products/:id` — update `name` / `description`
- `GET /health` — no artificial delay

## Caching table

| Data | Where cached | For how long | How invalidated |
|---|---|---|---|
| Product list | **api**, in-memory `TtlCache` | 30 s (`CACHE_TTL_MS`) | `PATCH /products/:id` deletes all `list:*`; also on TTL expiry |
| Product by id (name/description) | **api**, `TtlCache` | 30 s | `PATCH` deletes `id:{id}`; on TTL expiry |
| Price and stock | **nowhere** | — | randomized on every request |
| Product list / product page / categories | **not cached on web** | — | fetched from the api on every render (the api cache above absorbs repeats within the TTL) |
| Price/stock on the product page | **not cached** | — | client polls `/api/price/[id]` every 5 s (route handler proxy → api) |
| Cart | **browser cookie** (`httpOnly`, 30 days) | until cleared | Server Actions `addToCart`/`removeFromCart`/`clearCart`; never server-cached — read inside `<Suspense>` on every request, so it cannot leak to another user |

## Decisions on ambiguous parts of the spec

1. **`/api` prefix** on endpoints (`/api/products` instead of `/products`) — kept as implemented; the frontend knows about it.
2. **Next.js 16 instead of 15** ("15+"): rendering uses the new Cache Components model (Partial Prerendering, `<Suspense>` streaming), not the Next 14/15 `revalidate`/fetch-cache model. All data caching lives in the api (`TtlCache`); the web tier caches nothing.
3. **Missing products stream a 404 with a 200 status**: since the web tier has no data cache, `/products/[id]` cannot be fully static, so `ensureStatic = "navigation"` was removed. The first visit to a nonexistent id serves the App Shell (HTTP 200) and streams the 404 content — a real 404 status would require request-time rendering of the whole route.
4. **A local web build requires a reachable api** (20 prerendered product shells); the Docker image builds the API in, so `docker compose up --build` is self-contained.
5. **Search**: 400 ms debounce + `router.replace` inside `startTransition` — the router applies only the latest navigation, so a stale response can never overwrite a newer one.
6. **Price chart**: recharts is loaded via `next/dynamic` — an async chunk (~105 kB gzip) fetched only on the product page; it is absent from the `/` and `/cart` bundles (verified via client-reference manifests).
7. **Filter categories** are collected on the web side from all catalog pages with parallel requests (the api has no categories endpoint); the api's `TtlCache` absorbs the repeats.

## First Load JS (Next 16 no longer prints the table — computed from manifests, gzip)

| Page | First Load JS |
|---|---|
| `/` | 46.6 kB |
| `/cart` | 47.8 kB |
| `/products/[id]` | 51.9 kB (+ recharts 105.1 kB async, this page only) |
| `/products/[id]/edit` | 54.9 kB |

## `next build` output

```
Route (app)
┌ ◐ /                        (Partial Prerender: static shell, list streams in)
├ ○ /_not-found
├ ƒ /api/price/[id]          (Dynamic: price is always fresh)
├ ◐ /cart                    (static shell, cart streams per request)
├   /products/[id]
│ ├ ◐ /products/[id]         (App Shell for unknown ids)
│ ├ ◐ /products/1 … /products/20   (shells prerendered at build time; product data streams per request)
│ └ ◐ [+18 more paths]
└   /products/[id]/edit
```
