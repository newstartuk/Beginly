"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/auth-client";
import SettingsSkeleton from "./SettingsSkeleton";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    isCurrentUserAdmin().then((isAdmin) => {
      if (!isAdmin) {
        router.replace("/dashboard");
        return;
      }
      setAllowed(true);
    });
  }, [router]);

  if (allowed !== true) return <SettingsSkeleton />;
  return <>{children}</>;
}
