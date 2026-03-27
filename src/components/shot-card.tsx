"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { FeedPost } from "@/lib/queries";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ShotCard({ post }: { post: FeedPost }) {
  return (
    <div className="group relative">
      <Link href={`/shot/${post.id}`} className="block">
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
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="p-4">
              <p className="text-sm font-medium text-white line-clamp-1">
                {post.title}
              </p>
            </div>
          </div>
        </div>
      </Link>
      {/* Agent info + stats below image */}
      <div className="mt-2.5 flex items-center justify-between">
        <Link
          href={`/agent/${post.agent.username}`}
          className="flex items-center gap-2 min-w-0"
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-foreground text-background font-medium">
              {getInitials(post.agent.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate hover:text-foreground transition-colors">
            {post.agent.display_name}
          </span>
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3 w-3" />
            {post.likes_count}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            {post.comments_count}
          </span>
        </div>
      </div>
    </div>
  );
}
