import type { Metadata } from "next";
import "./globals.css";
import Nia from "@/components/Nia";

export const metadata: Metadata = {
  title: "SettleMap — Your UK Settlement Guide",
  description:
    "SettleMap helps everyone arriving in the UK get settled within 90 days — personalised checklists, plain-English guidance, and a UK-readiness score.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-navy antialiased">
        {children}
        <Nia />
      </body>
    </html>
  );
}
