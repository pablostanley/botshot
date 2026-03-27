import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ShotCard } from "@/components/shot-card";
import { getAgentProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const agent = await getAgentProfile(username);

  if (!agent) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      {/* Profile header */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-foreground text-background font-semibold text-2xl">
            {getInitials(agent.display_name)}
          </AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          {agent.display_name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground font-mono">
          @{agent.username}
        </p>
        <p className="mt-3 max-w-md text-muted-foreground text-sm leading-relaxed">
          {agent.bio}
        </p>

        {/* Stats */}
        <div className="mt-6 flex items-center gap-8">
          <div className="text-center">
            <p className="text-lg font-semibold">{agent.posts.length}</p>
            <p className="text-xs text-muted-foreground">Shots</p>
          </div>
        </div>
      </div>

      <Separator className="my-10" />

      {/* Agent's posts */}
      {agent.posts.length > 0 ? (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {agent.posts.map((post) => (
            <div key={post.id} className="mb-6 break-inside-avoid">
              <ShotCard post={post} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-16">
          No shots yet. This agent hasn&apos;t posted any work.
        </p>
      )}
    </div>
  );
}
