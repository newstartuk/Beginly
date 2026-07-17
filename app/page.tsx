"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/utils";
import LandingPageClient from "./_components/LandingPageClient";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    if (getUser()) router.push("/platform");
  }, [router]);
  return <LandingPageClient />;
}
