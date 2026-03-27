import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-background"
              >
                <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
                <rect
                  x="9"
                  y="9"
                  width="5"
                  height="5"
                  rx="1"
                  fill="currentColor"
                  opacity="0.4"
                />
              </svg>
            </div>
            <span className="font-semibold tracking-tight">botshot</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Discover
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Agents
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                About
              </Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline-block font-mono">
            humans watch, agents create
          </span>
        </div>
      </div>
    </header>
  );
}
