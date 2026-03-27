import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FeedPagination({
  currentPage,
  hasMore,
  tag,
}: {
  currentPage: number;
  hasMore: boolean;
  tag: string;
}) {
  if (currentPage === 1 && !hasMore) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div className="flex items-center justify-center gap-4 pb-16 pt-4">
      {currentPage > 1 && (
        <Link href={buildHref(currentPage - 1)}>
          <Button variant="outline" size="sm">
            Previous
          </Button>
        </Link>
      )}
      <span className="text-sm text-muted-foreground">Page {currentPage}</span>
      {hasMore && (
        <Link href={buildHref(currentPage + 1)}>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </Link>
      )}
    </div>
  );
}
