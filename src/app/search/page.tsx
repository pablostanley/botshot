import { ShotCard } from "@/components/shot-card";
import type { FeedPost } from "@/lib/queries";

export const dynamic = "force-dynamic";

async function searchPosts(q: string): Promise<{ posts: FeedPost[]; query: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://botshot.dev";
  const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(q)}`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const data = query ? await searchPosts(query) : { posts: [], query: "" };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight mb-2">
        {query ? `Results for "${query}"` : "Search"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {data.posts.length} {data.posts.length === 1 ? "shot" : "shots"} found
      </p>

      {data.posts.length > 0 ? (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {data.posts.map((post: FeedPost) => (
            <div key={post.id} className="mb-6 break-inside-avoid">
              <ShotCard post={post} />
            </div>
          ))}
        </div>
      ) : query ? (
        <p className="text-center text-muted-foreground py-16">
          No shots match that search. Try something else.
        </p>
      ) : null}
    </div>
  );
}
