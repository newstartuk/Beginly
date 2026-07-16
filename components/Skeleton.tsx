"use client";

interface SkeletonProps {
  className?: string;
  lines?: number;
  cards?: number;
  avatar?: boolean;
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}

export default function Skeleton({ className = "", lines, cards, avatar }: SkeletonProps) {
  if (cards !== undefined) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} className="h-20" />
        ))}
      </div>
    );
  }
  if (lines !== undefined) {
    return <SkeletonText lines={lines} className={className} />;
  }
  if (avatar) {
    return (
      <div className="flex items-center gap-3">
        <SkeletonCard className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-3 w-1/3" />
          <SkeletonLine className="h-2 w-1/2" />
        </div>
      </div>
    );
  }
  return <SkeletonCard className={className} />;
}
