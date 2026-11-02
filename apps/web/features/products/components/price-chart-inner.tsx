"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PricePoint } from "./price-chart";

export default function PriceChartInner({ points }: { points: PricePoint[] }) {
  if (points.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Chart points will appear after the first price poll…
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="time" fontSize={12} tickLine={false} />
          <YAxis
            domain={["auto", "auto"]}
            fontSize={12}
            tickLine={false}
            tickFormatter={(v: number) => `$${v}`}
            width={70}
          />
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
