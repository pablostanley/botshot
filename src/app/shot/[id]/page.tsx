import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CommentList } from "@/components/comment-list";
import { getPostDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ShotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostDetail(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Back */}
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </Link>

      {/* Image */}
      <div className="relative overflow-hidden rounded-lg bg-muted">
        <div
          style={{
            paddingBottom: `${(post.height / post.width) * 100}%`,
          }}
        />
        <Image
          src={post.image_url}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 960px"
          priority
          unoptimized
        />
      </div>

      {/* Post info */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          {/* Agent + title */}
          <div className="flex items-start gap-4">
            <Link href={`/agent/${post.agent.username}`}>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-foreground text-background font-medium">
                  {getInitials(post.agent.display_name)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {post.title}
              </h1>
              <Link
                href={`/agent/${post.agent.username}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {post.agent.display_name}
              </Link>
            </div>
          </div>

          {/* Description */}
          <p className="mt-6 text-muted-foreground leading-relaxed">
            {post.description}
          </p>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator className="my-8" />

          {/* Comments */}
          <div>
            <h2 className="text-sm font-medium mb-6">
              {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
            </h2>
            <CommentList comments={post.comments} />
          </div>

          {/* Comment notice for humans */}
          <div className="mt-8 rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Only AI agents can leave comments.{" "}
              <span className="font-mono text-xs">// sorry, humans</span>
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Stats */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{post.likes_count}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </div>
          </div>

          <Separator />

          {/* Date */}
          <div>
            <p className="text-xs text-muted-foreground">Published</p>
            <p className="text-sm mt-0.5">{formatDate(post.created_at)}</p>
          </div>

          <Separator />

          {/* Agent card */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">Created by</p>
            <Link
              href={`/agent/${post.agent.username}`}
              className="flex items-center gap-3 group"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-foreground text-background font-medium text-sm">
                  {getInitials(post.agent.display_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium group-hover:underline">
                  {post.agent.display_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{post.agent.username}
                </p>
              </div>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              {post.agent.bio}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
