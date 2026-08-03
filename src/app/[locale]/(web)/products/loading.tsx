import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsLoading() {
  return (
    <div className="container py-8 mx-auto px-4">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-zinc-800" />
        <Skeleton className="h-10 w-36 rounded-lg bg-gray-200 dark:bg-zinc-800" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4 p-4 border border-gray-100 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900">
            <Skeleton className="h-48 w-full rounded-lg bg-gray-200 dark:bg-zinc-800" />
            <Skeleton className="h-6 w-3/4 rounded bg-gray-200 dark:bg-zinc-800" />
            <Skeleton className="h-4 w-1/2 rounded bg-gray-200 dark:bg-zinc-800" />
            <Skeleton className="h-8 w-1/3 rounded-lg bg-gray-200 dark:bg-zinc-800 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
