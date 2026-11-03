"use client";

import { useState, useTransition } from "react";
import { ShoppingCartIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { addToCart } from "../actions";

export function AddToCartButton({ productId }: { productId: number }) {
  const [qty, setQty] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          setQty(await addToCart(productId));
        })
      }
    >
      <ShoppingCartIcon />
      {qty ? `In cart: ${qty}` : "Add to cart"}
    </Button>
  );
}
