import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      error: "File upload is temporarily disabled while Beginly's secure document-ingestion service is being completed. Paste text into Document Helper instead.",
      code: "secure_upload_not_enabled",
    },
    { status: 404 },
  );
}
