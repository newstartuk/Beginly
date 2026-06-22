"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Nia from "./Nia";

export default function NiaWrapper() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Local session read (no network) — just need to know if signed in.
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsAuthed(Boolean(data.session?.user));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isAuthed) return null;
  return <Nia />;
}
