"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const ALL_CATEGORIES = "__all__";

export function CategoryFilter({
  categories,
  current,
}: {
  categories: string[];
  current?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === ALL_CATEGORIES) {
      params.delete("category");
    } else {
      params.set("category", next);
    }
    params.delete("page");
    startTransition(() => {
      router.replace(`/?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <Select value={current ?? ALL_CATEGORIES} onValueChange={onChange}>
      <SelectTrigger className="w-52" aria-label="Category">
        <SelectValue placeholder="All categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
