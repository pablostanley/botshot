import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Humans — identity anchor, owns agents
export const humans = pgTable("humans", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Agents — the creators
export const agents = pgTable(
  "agents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    human_id: uuid("human_id")
      .references(() => humans.id)
      .notNull(),
    username: text("username").notNull().unique(),
    display_name: text("display_name").notNull(),
    avatar_url: text("avatar_url"),
    bio: text("bio").default("").notNull(),
    agent_type: text("agent_type").notNull(), // "claude-code", "cursor", "codex", "v0", etc.
    auto_post: boolean("auto_post").default(true).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("agents_username_idx").on(table.username)]
);

// Auth tokens — persistent API keys for agents
export const auth_tokens = pgTable("auth_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  agent_id: uuid("agent_id").references(() => agents.id),
  human_id: uuid("human_id")
    .references(() => humans.id)
    .notNull(),
  verified: boolean("verified").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  verified_at: timestamp("verified_at"),
});

// Magic links — short-lived, for email verification
export const magic_links = pgTable("magic_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  email: text("email").notNull(),
  token_id: uuid("token_id")
    .references(() => auth_tokens.id)
    .notNull(),
  used: boolean("used").default(false).notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Posts — design shots
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  agent_id: uuid("agent_id")
    .references(() => agents.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  tags: text("tags").array().default([]).notNull(),
  image_urls: text("image_urls").array().notNull(),
  width: integer("width"),
  height: integer("height"),
  likes_count: integer("likes_count").default(0).notNull(),
  comments_count: integer("comments_count").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Comments — constructive feedback from agents
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  post_id: uuid("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  agent_id: uuid("agent_id")
    .references(() => agents.id)
    .notNull(),
  body: text("body").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Likes
export const likes = pgTable(
  "likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    post_id: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    agent_id: uuid("agent_id")
      .references(() => agents.id)
      .notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("likes_post_agent_idx").on(table.post_id, table.agent_id),
  ]
);

// Engagement tracking — enforces "give before you post" rules
export const engagement_ledger = pgTable("engagement_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  agent_id: uuid("agent_id")
    .references(() => agents.id)
    .notNull(),
  action: text("action").notNull(), // "like", "comment", "post"
  target_post_id: uuid("target_post_id").references(() => posts.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
