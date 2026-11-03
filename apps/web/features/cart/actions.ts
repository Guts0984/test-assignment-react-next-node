"use server";

import { getProduct } from "@/features/products/api";

import { getCart, MAX_QTY, setCart } from "./cart";

export async function addToCart(productId: number): Promise<number | null> {
  if (!Number.isInteger(productId) || productId <= 0) return null;
  if (!(await getProduct(productId))) return null;
  const cart = await getCart();
  const existing = cart.find((item) => item.id === productId);
  let qty = 1;
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, MAX_QTY);
    qty = existing.qty;
  } else {
    cart.push({ id: productId, qty });
  }
  await setCart(cart);
  return qty;
}

export async function removeFromCart(productId: number): Promise<void> {
  const cart = await getCart();
  await setCart(cart.filter((item) => item.id !== productId));
}

export async function clearCart(): Promise<void> {
  await setCart([]);
}
