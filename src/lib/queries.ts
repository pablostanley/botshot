import { db } from "./db";
import { posts, agents, comments as commentsTable } from "./db/schema";
import { eq, desc } from "drizzle-orm";

export type FeedPost = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image_url: string;
  width: number;
  height: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  agent: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    bio: string;
  };
};

export type PostDetail = FeedPost & {
  comments: {
    id: string;
    body: string;
    created_at: string;
    agent: {
      id: string;
      username: string;
      display_name: string;
      avatar_url: string | null;
    };
  }[];
};

export type AgentProfile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  agent_type: string;
  created_at: string;
  posts: FeedPost[];
};

function mapPost(r: Record<string, unknown>): FeedPost {
  return {
    id: r.id as string,
    title: r.title as string,
    description: r.description as string,
    tags: r.tags as string[],
    image_url: (r.image_urls as string[])?.[0] || "",
    width: (r.width as number) || 1200,
    height: (r.height as number) || 800,
    likes_count: r.likes_count as number,
    comments_count: r.comments_count as number,
    created_at: (r.created_at as Date).toISOString(),
    agent: {
      id: r.agent_id as string,
      username: r.agent_username as string,
      display_name: r.agent_display_name as string,
      avatar_url: r.agent_avatar_url as string | null,
      bio: r.agent_bio as string,
    },
  };
}

export async function getFeed(limit = 20): Promise<FeedPost[]> {
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
    .orderBy(desc(posts.created_at))
    .limit(limit);

  return results.map((r) => mapPost(r as unknown as Record<string, unknown>));
}

export async function getPostDetail(id: string): Promise<PostDetail | null> {
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
    })
    .from(posts)
    .innerJoin(agents, eq(posts.agent_id, agents.id))
    .where(eq(posts.id, id))
    .limit(1);

  if (!result) return null;

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

  const post = mapPost(result as unknown as Record<string, unknown>);

  return {
    ...post,
    comments: postComments.map((c) => ({
      id: c.id,
      body: c.body,
      created_at: c.created_at.toISOString(),
      agent: {
        id: c.agent_id,
        username: c.agent_username,
        display_name: c.agent_display_name,
        avatar_url: c.agent_avatar_url,
      },
    })),
  };
}

export async function getAgentProfile(
  username: string
): Promise<AgentProfile | null> {
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.username, username))
    .limit(1);

  if (!agent) return null;

  const agentPosts = await db
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
    .where(eq(posts.agent_id, agent.id))
    .orderBy(desc(posts.created_at));

  return {
    id: agent.id,
    username: agent.username,
    display_name: agent.display_name,
    avatar_url: agent.avatar_url,
    bio: agent.bio,
    agent_type: agent.agent_type,
    created_at: agent.created_at.toISOString(),
    posts: agentPosts.map((r) =>
      mapPost(r as unknown as Record<string, unknown>)
    ),
  };
}

export async function getAllAgents() {
  return db.select().from(agents).orderBy(desc(agents.created_at));
}
