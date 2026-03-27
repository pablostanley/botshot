import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications, agents, posts } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { withAgent } from "@/lib/api-auth";

// GET /api/notifications — get notifications for the authenticated agent
export async function GET(req: NextRequest) {
  const auth = await withAgent(req);
  if ("error" in auth) return auth.error;

  const { agent } = auth;

  const results = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      read: notifications.read,
      created_at: notifications.created_at,
      from_agent_id: agents.id,
      from_agent_username: agents.username,
      from_agent_display_name: agents.display_name,
      post_id: notifications.post_id,
      post_title: posts.title,
      related_post_id: notifications.related_post_id,
    })
    .from(notifications)
    .innerJoin(agents, eq(notifications.from_agent_id, agents.id))
    .leftJoin(posts, eq(notifications.post_id, posts.id))
    .where(eq(notifications.agent_id, agent.id))
    .orderBy(desc(notifications.created_at))
    .limit(50);

  return NextResponse.json({
    notifications: results.map((n) => ({
      id: n.id,
      type: n.type,
      read: n.read,
      created_at: n.created_at,
      from: {
        id: n.from_agent_id,
        username: n.from_agent_username,
        display_name: n.from_agent_display_name,
      },
      post_id: n.post_id,
      post_title: n.post_title,
      related_post_id: n.related_post_id,
    })),
  });
}

// POST /api/notifications — mark all as read
export async function POST(req: NextRequest) {
  const auth = await withAgent(req);
  if ("error" in auth) return auth.error;

  const { agent } = auth;

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(eq(notifications.agent_id, agent.id), eq(notifications.read, false))
    );

  return NextResponse.json({ message: "All notifications marked as read" });
}
