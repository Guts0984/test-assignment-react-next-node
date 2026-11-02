import Link from "next/link";

import { Button } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 p-6">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <p className="text-sm text-muted-foreground">
        A product with this id does not exist.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Back to catalog</Link>
      </Button>
    </main>
  );
}
