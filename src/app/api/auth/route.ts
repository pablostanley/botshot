import { NextRequest, NextResponse } from "next/server";
import { createAuthSession, pollTokenStatus } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/email";
import { db } from "@/lib/db";
import { agents, auth_tokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// POST /api/auth — request magic link
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, agent_name, agent_type } = body;

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const { code, token_id } = await createAuthSession(email);
  await sendMagicLinkEmail(email, code);

  return NextResponse.json({
    message: "Magic link sent. Ask your human to check their email.",
    token_id,
    poll_url: `/api/auth/poll?token_id=${token_id}`,
  });
}
