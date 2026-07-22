import { NextRequest, NextResponse } from "next/server";
import { parseCheckInInput, type CheckInChange } from "@/lib/contracts/platform";
import { requireApiActor, apiFailure } from "@/lib/platform/api-auth";

// One prompt, question, or link per selectable change — shown back to the user
// immediately after they submit, so picking an option always leads somewhere
// instead of a single generic "thanks for the update".
const FOLLOW_UPS: Record<CheckInChange, { message: string; href?: string; linkLabel?: string }> = {
  urgent: {
    message: "If you're in immediate danger, call 999 first. Otherwise, our Emergency page has support contacts and next steps.",
    href: "/emergency",
    linkLabel: "Open Emergency support",
  },
  visa_change: {
    message: "Visa and immigration changes can affect tasks across your journey. Review your UKVI account and check whether any settlement tasks now apply to you.",
    href: "/checklist",
    linkLabel: "Review your Task Library",
  },
  moved_home: {
    message: "A new address can change your council tax, GP registration, and utility tasks. Update your details and revisit your local-admin tasks.",
    href: "/settings",
    linkLabel: "Update your details",
  },
  new_job: {
    message: "A new job can change your tax code, National Insurance contributions, and work-hour limits if you're on a visa that restricts them.",
    href: "/work-hours",
    linkLabel: "Check your work hours",
  },
  family_change: {
    message: "Household changes can affect benefits, council tax, and who's on your Beginly household. Review your household settings when you have a moment.",
    href: "/household",
    linkLabel: "Review your household",
  },
  health: {
    message: "If it's urgent, call 999 or 111. Otherwise, here's where to find a GP, pharmacy, or mental health support.",
    href: "/nhs",
    linkLabel: "Open health resources",
  },
  all_good: {
    message: "Good to hear. We'll keep your roadmap as it is.",
  },
};

export async function POST(request: NextRequest) {
  let requestId: string | undefined;
  try {
    const actor = await requireApiActor(request);
    requestId = actor.requestId;
    const input = parseCheckInInput(await request.json());

    if (!actor.demo) {
      const { data: member } = await actor.supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", actor.userId)
        .limit(1)
        .maybeSingle();
      const householdId = (member as { household_id?: string } | null)?.household_id;

      const { error } = await actor.supabase.from("life_events").upsert(
        {
          user_id: actor.userId,
          household_id: householdId ?? null,
          event_type: "life_change_reported",
          occurred_at: new Date().toISOString(),
          facts: { changes: input.changes },
          provenance: { request_id: requestId, source: "adaptive_check_in" },
          idempotency_key: `checkin:${actor.userId}:${input.idempotencyKey}`,
        },
        { onConflict: "idempotency_key", ignoreDuplicates: true },
      );
      // A failed household lookup or write shouldn't block the user from seeing
      // their follow-up — this is a best-effort signal, not a required action.
      if (error) console.error("check-in life_events write failed", error);
    }

    const followUps = input.changes.map((change) => ({ change, ...FOLLOW_UPS[change] }));
    return NextResponse.json({ saved: true, followUps }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    return apiFailure(error, requestId);
  }
}
