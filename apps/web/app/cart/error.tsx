"use client";

import { Button } from "@/shared/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 p-6">
      <h1 className="text-2xl font-bold">Failed to load the cart</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
