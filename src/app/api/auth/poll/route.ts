import { NextRequest, NextResponse } from "next/server";
import { pollTokenStatus } from "@/lib/auth";

// GET /api/auth/poll?token_id=... — CLI polls this after requesting magic link
export async function GET(req: NextRequest) {
  const tokenId = req.nextUrl.searchParams.get("token_id");

  if (!tokenId) {
    return NextResponse.json(
      { error: "token_id required" },
      { status: 400 }
    );
  }

  const result = await pollTokenStatus(tokenId);

  if (!result) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  if (!result.verified) {
    return NextResponse.json({ verified: false, message: "Waiting for human to click the magic link..." });
  }

  return NextResponse.json({
    verified: true,
    token: result.token,
    message: "Authenticated! Your human came through.",
  });
}
