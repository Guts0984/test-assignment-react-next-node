import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-72 w-full max-w-xl" />
    </main>
  );
}
