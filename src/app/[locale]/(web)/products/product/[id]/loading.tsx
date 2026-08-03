import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="container py-8 mx-auto px-4">
      {/* Main product header & gallery skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Image gallery skeleton */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Skeleton className="w-full h-[380px] sm:h-[480px] rounded-2xl bg-gray-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-4 gap-3">
            <Skeleton className="w-full h-20 sm:h-24 rounded-xl bg-gray-200 dark:bg-zinc-800" />
            <Skeleton className="w-full h-20 sm:h-24 rounded-xl bg-gray-200 dark:bg-zinc-800" />
            <Skeleton className="w-full h-20 sm:h-24 rounded-xl bg-gray-200 dark:bg-zinc-800" />
            <Skeleton className="w-full h-20 sm:h-24 rounded-xl bg-gray-200 dark:bg-zinc-800" />
          </div>
        </div>

        {/* Right column: Info & Price card skeleton */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-3/4 rounded-lg bg-gray-200 dark:bg-zinc-800" />
            <Skeleton className="h-5 w-1/2 rounded-md bg-gray-200 dark:bg-zinc-800" />
          </div>

          <Skeleton className="h-12 w-2/5 rounded-xl bg-gray-200 dark:bg-zinc-800" />

          {/* Key Features Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <Skeleton className="h-16 w-full rounded-xl bg-gray-200 dark:bg-zinc-800" />
            <Skeleton className="h-16 w-full rounded-xl bg-gray-200 dark:bg-zinc-800" />
            <Skeleton className="h-16 w-full rounded-xl bg-gray-200 dark:bg-zinc-800" />
          </div>

          {/* Seller / Contact Action Skeleton */}
          <div className="flex flex-col gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800">
            <Skeleton className="h-14 w-full rounded-xl bg-gray-200 dark:bg-zinc-800" />
            <Skeleton className="h-12 w-full rounded-xl bg-gray-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Description & Specification skeleton */}
      <div className="mt-12 flex flex-col gap-6">
        <Skeleton className="h-8 w-48 rounded-md bg-gray-200 dark:bg-zinc-800" />
        <Skeleton className="h-24 w-full rounded-xl bg-gray-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
