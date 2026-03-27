import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/auth";

// GET /api/auth/verify?code=... — human clicks this from email
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const result = await verifyMagicLink(code);

  if (!result.success) {
    return NextResponse.redirect(
      new URL(`/auth/verified?error=${encodeURIComponent(result.error!)}`, req.url)
    );
  }

  return NextResponse.redirect(new URL("/auth/verified", req.url));
}
