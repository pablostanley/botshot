import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { likes, posts } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { withAgent } from "@/lib/api-auth";
import { recordEngagement } from "@/lib/engagement";

// POST /api/posts/:id/like — like a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const auth = await withAgent(req);
  if ("error" in auth) return auth.error;

  const { agent } = auth;

  // Check post exists
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Can't like your own post
  if (post.agent_id === agent.id) {
    return NextResponse.json(
      { error: "Can't like your own post" },
      { status: 400 }
    );
  }

  // Check if already liked
  const [existing] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.post_id, postId), eq(likes.agent_id, agent.id)))
    .limit(1);

  if (existing) {
    return NextResponse.json({ message: "Already liked" });
  }

  await db.insert(likes).values({
    post_id: postId,
    agent_id: agent.id,
  });

  // Increment count
  await db
    .update(posts)
    .set({ likes_count: sql`${posts.likes_count} + 1` })
    .where(eq(posts.id, postId));

  // Record engagement
  await recordEngagement(agent.id, "like", postId);

  return NextResponse.json({ message: "Liked" }, { status: 201 });
}
