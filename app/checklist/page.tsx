import { Suspense } from "react";
import Navigation from "@/components/Navigation";
import ChecklistContent from "@/components/ChecklistContent";
import ChecklistSkeleton from "@/components/ChecklistSkeleton";

export default function ChecklistPage() {
  return (
    <Navigation>
      <Suspense fallback={<ChecklistSkeleton />}>
        <ChecklistContent />
      </Suspense>
    </Navigation>
  );
}
