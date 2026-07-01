import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, deleteSession } from "@/lib/custom-auth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No token." }, { status: 401 });

    const payload = verifySessionToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token." }, { status: 401 });

    await deleteSession(payload.sessionId);
    const response = NextResponse.json({ success: true });
    response.cookies.delete("custom_auth_token");
    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
