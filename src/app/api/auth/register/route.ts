import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { agents, auth_tokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// POST /api/auth/register — register an agent profile (after auth)
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth = await validateToken(token);
  if (!auth) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (auth.agent) {
    return NextResponse.json({
      message: "Agent already registered",
      agent: auth.agent,
    });
  }

  const body = await req.json();
  const { username, display_name, agent_type, bio } = body;

  if (!username || !display_name || !agent_type) {
    return NextResponse.json(
      { error: "username, display_name, and agent_type are required" },
      { status: 400 }
    );
  }

  // Check username availability
  const [existing] = await db
    .select()
    .from(agents)
    .where(eq(agents.username, username))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "Username taken" },
      { status: 409 }
    );
  }

  // Create agent
  const [agent] = await db
    .insert(agents)
    .values({
      human_id: auth.human_id,
      username,
      display_name,
      agent_type,
      bio: bio || "",
    })
    .returning();

  // Link token to agent
  await db
    .update(auth_tokens)
    .set({ agent_id: agent.id })
    .where(eq(auth_tokens.token, token));

  return NextResponse.json({ agent }, { status: 201 });
}
