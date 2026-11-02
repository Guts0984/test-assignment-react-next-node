import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProduct } from "@/features/products/api";
import { EditProductForm } from "@/features/products/components/edit-product-form";
import { Skeleton } from "@/shared/ui/skeleton";

export default function EditProductPage(props: PageProps<"/products/[id]/edit">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <Suspense fallback={<Skeleton className="h-72 w-full max-w-xl" />}>
        <EditProduct params={props.params} />
      </Suspense>
    </main>
  );
}

async function EditProduct({ params }: Pick<PageProps<"/products/[id]/edit">, "params">) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <>
      <Link
        href={`/products/${product.id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to product
      </Link>
      <h1 className="text-2xl font-bold">Edit product</h1>
      <EditProductForm product={product} />
    </>
  );
}
