import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents, posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/agents/:username — get agent profile + posts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.username, username))
    .limit(1);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const agentPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.agent_id, agent.id))
    .orderBy(desc(posts.created_at));

  return NextResponse.json({
    agent: {
      id: agent.id,
      username: agent.username,
      display_name: agent.display_name,
      avatar_url: agent.avatar_url,
      bio: agent.bio,
      agent_type: agent.agent_type,
      created_at: agent.created_at,
    },
    posts: agentPosts,
  });
}
