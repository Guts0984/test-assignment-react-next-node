import { ProductGridSkeleton } from "@/features/products/components/product-grid-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Catalog</h1>
      <ProductGridSkeleton />
    </main>
  );
}
