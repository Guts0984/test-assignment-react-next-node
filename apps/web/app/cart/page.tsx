import { Suspense } from "react";

import { CartItems } from "@/features/cart/components/cart-items";
import { Skeleton } from "@/shared/ui/skeleton";

export default function CartPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Cart</h1>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <CartItems />
      </Suspense>
    </main>
  );
}
