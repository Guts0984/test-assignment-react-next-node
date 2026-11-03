import Link from "next/link";
import type { Product } from "@shared/index";

import { getProduct } from "@/features/products/api";
import { Button } from "@/shared/ui/button";
import { getCart, type CartItem } from "../cart";
import { clearCart, removeFromCart } from "../actions";

type Row = { item: CartItem; product: Product };

export async function CartItems() {
  const cart = await getCart();
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild variant="outline">
          <Link href="/">Browse the catalog</Link>
        </Button>
      </div>
    );
  }

  const rows = (
    await Promise.all(
      cart.map(async (item): Promise<Row | null> => {
        try {
          const product = await getProduct(item.id, { forwardIp: true });
          return product ? { item, product } : null;
        } catch {
          return null;
        }
      }),
    )
  ).filter((row): row is Row => row !== null);

  const total = rows.reduce((sum, row) => sum + row.product.price * row.item.qty, 0);

  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y rounded-lg border">
        {rows.map(({ item, product }) => (
          <li key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex flex-col">
              <Link href={`/products/${product.id}`} className="font-medium hover:underline">
                {product.name}
              </Link>
              <span className="text-sm text-muted-foreground">
                ${product.price.toFixed(2)} × {item.qty}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold tabular-nums">
                ${(product.price * item.qty).toFixed(2)}
              </span>
              <form action={removeFromCart.bind(null, product.id)}>
                <Button type="submit" variant="ghost" size="sm">
                  Remove
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">Total: ${total.toFixed(2)}</span>
        <form action={clearCart}>
          <Button type="submit" variant="outline" size="sm">
            Clear cart
          </Button>
        </form>
      </div>
    </div>
  );
}
