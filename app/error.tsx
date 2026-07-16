"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-4">
      <div className="text-6xl font-extrabold text-red-200 select-none">!</div>
      <h1 className="text-2xl font-bold text-navy">Something went wrong</h1>
      <p className="text-muted max-w-sm">
        We encountered an unexpected error. Your data is safe — please try again.
      </p>
      <div className="flex gap-3 pt-2">
        <button
          onClick={reset}
          className="btn-primary"
        >
          Try again
        </button>
        <Link href="/" className="btn-ghost">
          Go home
        </Link>
      </div>
    </div>
  );
}
