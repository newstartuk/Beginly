import Link from "next/link";
import { CheckCircle, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Logo size={32} className="rounded-lg" />
            <span className="font-bold text-navy">Beginly</span>
          </Link>
        </div>

        <div className="card space-y-4 text-center">
          {error ? (
            <>
              <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
              <div>
                <h1 className="text-lg font-bold text-navy">Link expired or invalid</h1>
                <p className="text-sm text-muted mt-2">
                  This unsubscribe link is no longer valid. You can manage email reminders directly from your account settings instead.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="w-10 h-10 text-green mx-auto" />
              <div>
                <h1 className="text-lg font-bold text-navy">You&apos;re unsubscribed</h1>
                <p className="text-sm text-muted mt-2">
                  You won&apos;t receive any more task reminder emails. You can turn them back on any time from settings.
                </p>
              </div>
            </>
          )}
          <Link href="/settings" className="btn-primary w-full justify-center">Go to settings</Link>
        </div>
      </div>
    </div>
  );
}
