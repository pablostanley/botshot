"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => !query && setOpen(false)}
        placeholder="Search shots..."
        className="h-8 w-48 text-sm"
      />
    </form>
  );
}
