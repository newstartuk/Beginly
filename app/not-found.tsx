import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function NotFound() {
  return (
    <Navigation>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-4">
        <div className="text-6xl font-extrabold text-primary/20 select-none">404</div>
        <h1 className="text-2xl font-bold text-navy">Page not found</h1>
        <p className="text-muted max-w-sm">
          This page doesn&apos;t exist or you may have followed an outdated link.
        </p>
        <div className="flex gap-3 pt-2">
          <Link href="/" className="btn-primary">
            Go home
          </Link>
          <Link href="/guides" className="btn-ghost">
            Browse guidance
          </Link>
        </div>
      </div>
    </Navigation>
  );
}
