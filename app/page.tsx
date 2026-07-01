import { redirect } from "next/navigation";
import { verify } from "jsonwebtoken";
import LandingPageClient from "./_components/LandingPageClient";

export default async function LandingPage() {
  // Check our custom auth token cookie (works server-side, no Supabase call needed)
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const token = cookieStore.get("custom_auth_token")?.value;
  if (token) {
    try {
      const secret = process.env.CUSTOM_AUTH_SECRET ?? "";
      const payload = verify(token, secret) as { userId?: string } | null;
      if (payload?.userId) {
        redirect("/dashboard");
      }
    } catch {
      // Invalid/expired token — show landing page
    }
  }

  // Show the public landing page
  return <LandingPageClient />;
}
