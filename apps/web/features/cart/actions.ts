"use server";

import { getCart, setCart } from "./cart";

export async function addToCart(productId: number): Promise<void> {
  const cart = await getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  await setCart(cart);
}

export async function removeFromCart(productId: number): Promise<void> {
  const cart = await getCart();
  await setCart(cart.filter((item) => item.id !== productId));
}

export async function clearCart(): Promise<void> {
  await setCart([]);
}
