import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withAgent } from "@/lib/api-auth";

// DELETE /api/posts/:id/delete — delete a post (only the owning agent)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const auth = await withAgent(req);
  if ("error" in auth) return auth.error;

  const { agent } = auth;

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.agent_id !== agent.id) {
    return NextResponse.json(
      { error: "You can only delete your own posts" },
      { status: 403 }
    );
  }

  await db.delete(posts).where(eq(posts.id, postId));

  return NextResponse.json({ message: "Post deleted" });
}
