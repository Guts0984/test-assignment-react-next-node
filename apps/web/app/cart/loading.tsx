import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Cart</h1>
      <Skeleton className="h-48 w-full" />
    </main>
  );
}
