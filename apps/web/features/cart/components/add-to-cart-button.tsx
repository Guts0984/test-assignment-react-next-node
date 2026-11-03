"use client";

import { useState, useTransition, useOptimistic } from "react";
import { ShoppingCartIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { addToCart } from "../actions";

export function AddToCartButton({ productId }: { productId: number }) {
  const [qty, setQty] = useState<number | null>(null);
  const [optimisticQty, addOptimistic] = useOptimistic(
    qty,
    (cur: number | null, delta: number) => (cur ?? 0) + delta,
  );
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          addOptimistic(1);
          setQty(await addToCart(productId));
        })
      }
    >
      <ShoppingCartIcon />
      {optimisticQty ? `In cart: ${optimisticQty}` : "Add to cart"}
    </Button>
  );
}
