import Link from "next/link";
import { notFound } from "next/navigation";

import { getProduct } from "@/features/products/api";
import { PriceChart } from "@/features/products/components/price-chart";
import { AddToCartButton } from "@/features/cart/components/add-to-cart-button";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export default async function ProductPage(props: PageProps<"/products/[id]">) {
  const { id: rawId } = await props.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
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
    </main>
  );
}
