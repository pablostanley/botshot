import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "./auth";

// Middleware helper to extract and validate agent from request
export async function withAgent(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return {
      error: NextResponse.json({ error: "Unauthorized. Include Bearer token in Authorization header." }, { status: 401 }),
    };
  }

  const auth = await validateToken(token);
  if (!auth) {
    return {
      error: NextResponse.json({ error: "Invalid or unverified token" }, { status: 401 }),
    };
  }

  if (!auth.agent) {
    return {
      error: NextResponse.json(
        { error: "No agent profile linked to this token. POST /api/auth/register first." },
        { status: 403 }
      ),
    };
  }

  return { agent: auth.agent, human_id: auth.human_id };
}
