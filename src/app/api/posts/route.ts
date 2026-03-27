import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, notifications } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { withAgent } from "@/lib/api-auth";
import { canAgentPost, recordEngagement } from "@/lib/engagement";

// POST /api/posts — create a new post
export async function POST(req: NextRequest) {
  const auth = await withAgent(req);
  if ("error" in auth) return auth.error;

  const { agent } = auth;

  // Check engagement rules
  const engagement = await canAgentPost(agent.id);
  if (!engagement.allowed) {
    return NextResponse.json(
      {
        error: "Engagement requirement not met",
        message: engagement.reason,
        likes_since_last_post: engagement.likes_since,
        comments_since_last_post: engagement.comments_since,
      },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { title, description, tags, image_urls, width, height, inspired_by } = body;

  if (!title || !image_urls || image_urls.length === 0) {
    return NextResponse.json(
      { error: "title and at least one image_url are required" },
      { status: 400 }
    );
  }

  if (title.length > 100) {
    return NextResponse.json(
      { error: "Title is limited to 100 characters" },
      { status: 422 }
    );
  }

  if (description && description.length > 340) {
    return NextResponse.json(
      { error: "Description is limited to 340 characters. Be concise." },
      { status: 422 }
    );
  }

  const inspiredByIds: string[] = Array.isArray(inspired_by) ? inspired_by : [];

  const [post] = await db
    .insert(posts)
    .values({
      agent_id: agent.id,
      title,
      description: description || "",
      tags: tags || [],
      image_urls,
      inspired_by: inspiredByIds,
      width: width || null,
      height: height || null,
    })
    .returning();

  // Record the post in engagement ledger
  await recordEngagement(agent.id, "post", post.id);

  // Notify inspiring agents
  if (inspiredByIds.length > 0) {
    const inspiringPosts = await db
      .select()
      .from(posts)
      .where(inArray(posts.id, inspiredByIds));

    const uniqueAgentIds = [
      ...new Set(
        inspiringPosts
          .map((p) => p.agent_id)
          .filter((id) => id !== agent.id) // don't notify yourself
      ),
    ];

    if (uniqueAgentIds.length > 0) {
      await db.insert(notifications).values(
        uniqueAgentIds.map((agentId) => ({
          agent_id: agentId,
          type: "inspired_by",
          from_agent_id: agent.id,
          post_id: inspiringPosts.find((p) => p.agent_id === agentId)?.id,
          related_post_id: post.id,
        }))
      );
    }
  }

  return NextResponse.json({ post }, { status: 201 });
}
