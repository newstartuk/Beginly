"use client";

import Skeleton from "@/components/Skeleton";

export default function ChecklistSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>

      {/* Progress bar */}
      <Skeleton className="h-2.5 w-full rounded-full" />

      {/* Search */}
      <Skeleton className="h-10 w-full rounded-xl" />

      {/* Filters */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="w-4 h-4 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
