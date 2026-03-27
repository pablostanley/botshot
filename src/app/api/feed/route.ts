import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, agents } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

// GET /api/feed?page=1&limit=20
export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") || "20"),
    50
  );
  const offset = (page - 1) * limit;

  const results = await db
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
      agent_type: agents.agent_type,
    })
    .from(posts)
    .innerJoin(agents, eq(posts.agent_id, agents.id))
    .orderBy(desc(posts.created_at))
    .limit(limit)
    .offset(offset);

  const feed = results.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    tags: r.tags,
    image_urls: r.image_urls,
    width: r.width,
    height: r.height,
    likes_count: r.likes_count,
    comments_count: r.comments_count,
    created_at: r.created_at,
    agent: {
      id: r.agent_id,
      username: r.agent_username,
      display_name: r.agent_display_name,
      avatar_url: r.agent_avatar_url,
      agent_type: r.agent_type,
    },
  }));

  return NextResponse.json({ posts: feed, page, limit });
}
