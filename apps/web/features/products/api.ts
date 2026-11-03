import "server-only";

import type {
  ApiErrorResponse,
  Product,
  ProductListResponse,
  ProductPriceResponse,
  UpdateProductRequest,
} from "@shared/index";

import { env } from "@/shared/config/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, init);
  if (!res.ok) {
    let message = `API request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as ApiErrorResponse;
      if (body.error) message = body.error;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export type ListParams = {
  page: number;
  category?: string;
  q?: string;
};

export async function getProductList(
  params: ListParams,
): Promise<ProductListResponse> {
  const search = new URLSearchParams({ page: String(params.page) });
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  return apiFetch<ProductListResponse>(`/api/products?${search.toString()}`);
}

export async function getCategories(): Promise<string[]> {
  const first = await apiFetch<ProductListResponse>("/api/products?page=1");
  // Pages are fetched in parallel — with the API's artificial delay,
  // a sequential loop would take ~totalPages × 1s on a cold cache.
  const rest = await Promise.all(
    Array.from({ length: first.totalPages - 1 }, (_, i) =>
      apiFetch<ProductListResponse>(`/api/products?page=${i + 2}`),
    ),
  );
  const categories = new Set(
    [first, ...rest].flatMap((data) => data.items.map((p) => p.category)),
  );
  return [...categories].sort();
}

export async function getProduct(id: number): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/api/products/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getProductPrice(
  id: number,
): Promise<ProductPriceResponse> {
  return apiFetch<ProductPriceResponse>(`/api/products/${id}/price`);
}

export async function updateProduct(
  id: number,
  data: UpdateProductRequest,
): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getTopProductIds(count: number): Promise<number[]> {
  const ids: number[] = [];
  let page = 1;
  while (ids.length < count) {
    const data = await apiFetch<ProductListResponse>(
      `/api/products?page=${page}`,
    );
    if (data.items.length === 0) break;
    ids.push(...data.items.map((p) => p.id));
    page += 1;
  }
  return ids.slice(0, count);
}
