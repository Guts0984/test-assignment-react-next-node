import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProduct, getTopProductIds } from "@/features/products/api";
import { PriceChart } from "@/features/products/components/price-chart";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export async function generateStaticParams() {
  try {
    const ids = await getTopProductIds(20);
    return ids.map((id) => ({ id: String(id) }));
  } catch (cause) {
    // Prerendered pages fetch the API at build time, so a build without a
    // reachable API cannot succeed — fail fast with a clear message.
    throw new Error(
      `web build requires the API to be reachable at API_URL (got ${process.env.API_URL ?? "http://localhost:3000"})`,
      { cause },
    );
  }
}

export default function ProductPage(props: PageProps<"/products/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={props.params} />
      </Suspense>
    </main>
  );
}

async function ProductDetails({
  params,
}: Pick<PageProps<"/products/[id]">, "params">) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to catalog
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <Badge variant="secondary">{product.category}</Badge>
        </div>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="flex gap-2 pt-2">
          <AddToCartButton productId={product.id} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/products/${product.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>
      <PriceChart productId={product.id} />
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
