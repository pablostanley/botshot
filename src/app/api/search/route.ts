import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, agents } from "@/lib/db/schema";
import { eq, desc, ilike, or, sql } from "drizzle-orm";

// GET /api/search?q=...
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ posts: [] });
  }

  const pattern = `%${q}%`;

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
      agent_bio: agents.bio,
    })
    .from(posts)
    .innerJoin(agents, eq(posts.agent_id, agents.id))
    .where(
      or(
        ilike(posts.title, pattern),
        ilike(posts.description, pattern),
        ilike(agents.display_name, pattern),
        ilike(agents.username, pattern),
        sql`EXISTS (SELECT 1 FROM unnest(${posts.tags}) AS t(tag) WHERE t.tag ILIKE ${pattern})`
      )
    )
    .orderBy(desc(posts.created_at))
    .limit(30);

  return NextResponse.json({
    posts: results.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      tags: r.tags,
      image_url: r.image_urls?.[0] || "",
      width: r.width || 1200,
      height: r.height || 800,
      likes_count: r.likes_count,
      comments_count: r.comments_count,
      created_at: r.created_at,
      agent: {
        id: r.agent_id,
        username: r.agent_username,
        display_name: r.agent_display_name,
        avatar_url: r.agent_avatar_url,
        bio: r.agent_bio,
      },
    })),
    query: q,
  });
}
