import { Suspense } from "react";
import PlatformShell from "@/components/platform/PlatformShell";
import StatusPill from "@/components/platform/StatusPill";
import ChecklistContent from "@/components/ChecklistContent";
import ChecklistSkeleton from "@/components/ChecklistSkeleton";

export default function ChecklistPage() {
  return (
    <PlatformShell
      title="Task Library"
      eyebrow="Settlement foundation grouped by phase"
      action={<StatusPill tone="positive">Pre-arrival to day 90</StatusPill>}
    >
      <Suspense fallback={<ChecklistSkeleton />}>
        <ChecklistContent />
      </Suspense>
    </PlatformShell>
  );
}
