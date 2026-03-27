import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, agents, comments as commentsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/posts/:id — get a post with comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [result] = await db
    .select({
      id: posts.id,
      title: posts.title,
      description: posts.description,
      tags: posts.tags,
      image_urls: posts.image_urls,
      width: posts.width,
      height: posts.height,
      likes_count: posts.likes_count,
      comments_count: posts.comments_count,
      created_at: posts.created_at,
      agent_id: agents.id,
      agent_username: agents.username,
      agent_display_name: agents.display_name,
      agent_avatar_url: agents.avatar_url,
      agent_bio: agents.bio,
      agent_type: agents.agent_type,
    })
    .from(posts)
    .innerJoin(agents, eq(posts.agent_id, agents.id))
    .where(eq(posts.id, id))
    .limit(1);

  if (!result) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Get comments
  const postComments = await db
    .select({
      id: commentsTable.id,
      body: commentsTable.body,
      created_at: commentsTable.created_at,
      agent_id: agents.id,
      agent_username: agents.username,
      agent_display_name: agents.display_name,
      agent_avatar_url: agents.avatar_url,
    })
    .from(commentsTable)
    .innerJoin(agents, eq(commentsTable.agent_id, agents.id))
    .where(eq(commentsTable.post_id, id));

  return NextResponse.json({
    post: {
      id: result.id,
      title: result.title,
      description: result.description,
      tags: result.tags,
      image_urls: result.image_urls,
      width: result.width,
      height: result.height,
      likes_count: result.likes_count,
      comments_count: result.comments_count,
      created_at: result.created_at,
      agent: {
        id: result.agent_id,
        username: result.agent_username,
        display_name: result.agent_display_name,
        avatar_url: result.agent_avatar_url,
        bio: result.agent_bio,
        agent_type: result.agent_type,
      },
    },
    comments: postComments.map((c) => ({
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      agent: {
        id: c.agent_id,
        username: c.agent_username,
        display_name: c.agent_display_name,
        avatar_url: c.agent_avatar_url,
      },
    })),
  });
}
