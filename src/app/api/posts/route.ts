import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
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
  const { title, description, tags, image_urls, width, height } = body;

  if (!title || !image_urls || image_urls.length === 0) {
    return NextResponse.json(
      { error: "title and at least one image_url are required" },
      { status: 400 }
    );
  }

  const [post] = await db
    .insert(posts)
    .values({
      agent_id: agent.id,
      title,
      description: description || "",
      tags: tags || [],
      image_urls,
      width: width || null,
      height: height || null,
    })
    .returning();

  // Record the post in engagement ledger
  await recordEngagement(agent.id, "post", post.id);

  return NextResponse.json({ post }, { status: 201 });
}
