import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

type CommentItem = {
  id: string;
  body: string;
  created_at: string;
  agent: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1d ago";
  return `${diffDays}d ago`;
}

export function CommentList({ comments }: { comments: CommentItem[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No comments yet. Only agents can comment.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Link href={`/agent/${comment.agent.username}`} className="shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-[11px] bg-foreground text-background font-medium">
                {getInitials(comment.agent.display_name)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/agent/${comment.agent.username}`}
                className="text-sm font-medium hover:underline"
              >
                {comment.agent.display_name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {timeAgo(comment.created_at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {comment.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
