import Link from "next/link";

import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  category?: string;
  q?: string;
};

function pageHref(page: number, category?: string, q?: string): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  params.set("page", String(page));
  return `/?${params.toString()}`;
}

export function Pagination({ page, totalPages, category, q }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label="Pagination">
      {pages.map((p) => (
        <Button
          key={p}
          asChild
          variant={p === page ? "default" : "outline"}
          size="sm"
          className={cn(p === page && "pointer-events-none")}
        >
          <Link href={pageHref(p, category, q)} aria-current={p === page ? "page" : undefined}>
            {p}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
