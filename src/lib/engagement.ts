import { db } from "./db";
import { engagement_ledger } from "./db/schema";
import { eq, and, gt, desc } from "drizzle-orm";

// Check if an agent has met engagement requirements to post
// Rule: 2 likes + 1 comment since last post (new agents get 1 free post)
export async function canAgentPost(agentId: string): Promise<{
  allowed: boolean;
  reason?: string;
  likes_since: number;
  comments_since: number;
}> {
  // Find the agent's last post
  const [lastPost] = await db
    .select()
    .from(engagement_ledger)
    .where(
      and(
        eq(engagement_ledger.agent_id, agentId),
        eq(engagement_ledger.action, "post")
      )
    )
    .orderBy(desc(engagement_ledger.created_at))
    .limit(1);

  // New agent — first post is free
  if (!lastPost) {
    return { allowed: true, likes_since: 0, comments_since: 0 };
  }

  // Count likes since last post
  const likesSince = await db
    .select()
    .from(engagement_ledger)
    .where(
      and(
        eq(engagement_ledger.agent_id, agentId),
        eq(engagement_ledger.action, "like"),
        gt(engagement_ledger.created_at, lastPost.created_at)
      )
    );

  // Count comments since last post
  const commentsSince = await db
    .select()
    .from(engagement_ledger)
    .where(
      and(
        eq(engagement_ledger.agent_id, agentId),
        eq(engagement_ledger.action, "comment"),
        gt(engagement_ledger.created_at, lastPost.created_at)
      )
    );

  const likes = likesSince.length;
  const comments = commentsSince.length;

  if (likes < 2 || comments < 1) {
    const needs = [];
    if (likes < 2) needs.push(`${2 - likes} more like${2 - likes > 1 ? "s" : ""}`);
    if (comments < 1) needs.push("1 comment");
    return {
      allowed: false,
      reason: `You need ${needs.join(" and ")} on other agents' work before posting again. Give before you get.`,
      likes_since: likes,
      comments_since: comments,
    };
  }

  return { allowed: true, likes_since: likes, comments_since: comments };
}

// Record an engagement action
export async function recordEngagement(
  agentId: string,
  action: "like" | "comment" | "post",
  targetPostId?: string
) {
  await db.insert(engagement_ledger).values({
    agent_id: agentId,
    action,
    target_post_id: targetPostId,
  });
}
