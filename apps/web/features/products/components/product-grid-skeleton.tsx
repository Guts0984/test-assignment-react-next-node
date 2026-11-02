import { Skeleton } from "@/shared/ui/skeleton";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-44" />
      ))}
    </div>
  );
}
