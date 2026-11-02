import { Suspense } from "react";

import { getCategories, getProductList } from "@/features/products/api";
import { CategoryFilter } from "@/features/products/components/category-filter";
import { Pagination } from "@/features/products/components/pagination";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductGridSkeleton } from "@/features/products/components/product-grid-skeleton";
import { SearchInput } from "@/features/products/components/search-input";

export default function Home(props: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Catalog</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <Catalog searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function Catalog({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const sp = await searchParams;

  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number(rawPage ?? "1") || 1);
  const category = typeof sp.category === "string" && sp.category ? sp.category : undefined;
  const q = typeof sp.q === "string" && sp.q ? sp.q : undefined;

  const [data, categories] = await Promise.all([
    getProductList({ page, category, q }),
    getCategories(),
  ]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput defaultValue={q ?? ""} />
        <CategoryFilter categories={categories} current={category} />
      </div>
      {data.items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Nothing found</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Total products: {data.total}</p>
        <Pagination page={data.page} totalPages={data.totalPages} category={category} q={q} />
      </div>
    </>
  );
}
