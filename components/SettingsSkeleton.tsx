import Skeleton from "@/components/Skeleton";

export default function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <Skeleton className="h-8 w-32" />

      {/* Profile card */}
      <div className="card">
        <Skeleton className="h-4 w-28 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>

      {/* Notifications card */}
      <div className="card">
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      {/* Danger zone */}
      <div className="card border-red-200">
        <Skeleton className="h-4 w-28 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-4" />
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
  );
}
