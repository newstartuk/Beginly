"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IntelligencePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/intelligence/scam-radar");
  }, [router]);

  return null;
}
