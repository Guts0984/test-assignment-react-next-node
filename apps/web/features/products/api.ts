import "server-only";

import { headers } from "next/headers";
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

async function clientIpHeaders(): Promise<Record<string, string>> {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded ? { "x-forwarded-for": forwarded } : {};
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  forwardIp = true,
): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      ...(forwardIp ? await clientIpHeaders() : {}),
      ...init?.headers,
    },
  });
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
  return apiFetch<string[]>("/api/products/categories");
}

export async function getProduct(
  id: number,
  { forwardIp = false }: { forwardIp?: boolean } = {},
): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/api/products/${id}`, undefined, forwardIp);
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
  for (let page = 1; ids.length < count; page++) {
    const data = await apiFetch<ProductListResponse>(
      `/api/products?page=${page}`,
      undefined,
      false,
    );
    if (data.items.length === 0) break;
    ids.push(...data.items.map((p) => p.id));
  }
  return ids.slice(0, count);
}
