"use client";

import { useState, useTransition, useOptimistic } from "react";
import { ShoppingCartIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { addToCart } from "../actions";

export function AddToCartButton({ productId }: { productId: number }) {
  const [added, setAdded] = useState(0);
  const [optimisticAdded, addOptimistic] = useOptimistic(
    added,
    (cur: number, delta: number) => cur + delta,
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
          await addToCart(productId);
          setAdded((cur) => cur + 1);
        })
      }
    >
      <ShoppingCartIcon />
      {optimisticAdded > 0 ? `In cart: ${optimisticAdded}` : "Add to cart"}
    </Button>
  );
}
