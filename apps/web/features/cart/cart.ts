import "server-only";

import { cookies } from "next/headers";

export type CartItem = {
  id: number;
  qty: number;
};

const CART_COOKIE = "cart";
export const MAX_QTY = 99;

function isCartItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) return false;
  const { id, qty } = item as Record<string, unknown>;
  return (
    Number.isInteger(id) &&
    (id as number) > 0 &&
    Number.isInteger(qty) &&
    (qty as number) > 0 &&
    (qty as number) <= MAX_QTY
  );
}

function parseCart(raw: string | undefined): CartItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

export async function getCart(): Promise<CartItem[]> {
  const store = await cookies();
  return parseCart(store.get(CART_COOKIE)?.value);
}

export async function setCart(items: CartItem[]): Promise<void> {
  const store = await cookies();
  if (items.length === 0) {
    store.delete(CART_COOKIE);
    return;
  }
  store.set(CART_COOKIE, JSON.stringify(items), {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  });
}
