"use client";

import type { ReactNode } from "react";
import { PopupButton } from "@typeform/embed-react";

/** Button that opens the adviser survey in a Typeform pop-up. */
export default function AdviserSurveyButton({
  formId,
  className,
  children,
}: {
  formId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    // Typeform uses this size on desktop and goes full screen on phones.
    <PopupButton id={formId} className={className} width={720} height={650}>
      {children}
    </PopupButton>
  );
}