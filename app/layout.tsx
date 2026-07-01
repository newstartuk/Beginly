import type { Metadata } from "next";
import "./globals.css";
import NiaWrapper from "@/components/NiaWrapper";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Beginly — Your UK Settlement Guide",
  description:
    "Beginly helps everyone arriving in the UK get settled within 90 days — personalised checklists, plain-English guidance, and a UK-readiness score.",
  openGraph: {
    title: "Beginly — Your UK Settlement Guide",
    description: "Free personalised checklist and guidance for everyone arriving in the UK.",
    url: "https://beginly.app",
    siteName: "Beginly",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Beginly — Your UK Settlement Guide",
    description: "Free personalised checklist and guidance for everyone arriving in the UK.",
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="bg-background text-navy antialiased">
        <AuthProvider>
          {children}
          <NiaWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
