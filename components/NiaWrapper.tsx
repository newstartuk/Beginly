"use client";
import { useEffect, useState } from "react";
import Nia from "./Nia";

export default function NiaWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only show Nia for authenticated users who are NOT on auth pages
    const session = document.cookie.includes("nsk_session");
    const isAuthPage = ["/login", "/signup"].some((p) =>
      window.location.pathname.startsWith(p)
    );
    if (session && !isAuthPage) {
      setMounted(true);
    }
  }, []);

  if (!mounted) return null;
  return <Nia />;
}
