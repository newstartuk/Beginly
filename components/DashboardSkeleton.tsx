"use client";

import Skeleton from "@/components/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-64" />
      </div>

      {/* Score + Stage */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card flex items-center gap-5">
          <Skeleton className="w-24 h-24 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="card flex items-center gap-5">
          <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>

      {/* Progress by category */}
      <div className="card space-y-4">
        <Skeleton className="h-4 w-40" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card text-center py-4 space-y-2">
            <Skeleton className="w-5 h-5 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
