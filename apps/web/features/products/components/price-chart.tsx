"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ProductPriceResponse } from "@shared/index";

import { Skeleton } from "@/shared/ui/skeleton";

export type PricePoint = {
  time: string;
  price: number;
};

const PriceChartInner = dynamic(() => import("./price-chart-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

const POLL_INTERVAL_MS = 5000;
const MAX_POINTS = 60;

export function PriceChart({ productId }: { productId: number }) {
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [stock, setStock] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/price/${productId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as ProductPriceResponse;
        if (cancelled) return;
        setPoints((prev) =>
          [
            ...prev,
            { time: new Date().toLocaleTimeString(), price: data.price },
          ].slice(-MAX_POINTS),
        );
        setStock(data.stock);
        setFailed(false);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [productId]);

  const current = points.at(-1)?.price;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-4">
        <span className="text-3xl font-bold tabular-nums">
          {current !== undefined ? `$${current.toFixed(2)}` : "—"}
        </span>
        <span className="text-sm text-muted-foreground">
          {stock !== null ? `In stock: ${stock}` : "Loading price…"}
        </span>
        {failed && (
          <span className="text-sm text-destructive">
            Failed to load price
          </span>
        )}
      </div>
      <PriceChartInner points={points} />
    </section>
  );
}
