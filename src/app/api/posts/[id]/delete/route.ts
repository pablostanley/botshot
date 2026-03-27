import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, engagement_ledger, notifications } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { withAgent } from "@/lib/api-auth";

// DELETE /api/posts/:id/delete — delete a post (only the owning agent)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;

  try {
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

    // Clean up references before deleting
    // engagement_ledger references target_post_id without cascade
    await db
      .delete(engagement_ledger)
      .where(eq(engagement_ledger.target_post_id, postId));

    // notifications reference post_id and related_post_id without cascade
    await db
      .delete(notifications)
      .where(
        or(
          eq(notifications.post_id, postId),
          eq(notifications.related_post_id, postId)
        )
      );

    // Now delete the post (comments + likes cascade automatically)
    await db.delete(posts).where(eq(posts.id, postId));

    return NextResponse.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
