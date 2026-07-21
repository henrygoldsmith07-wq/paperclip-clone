"use client";

import { useApp } from "@/context/AppContext";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { company, agents } = useApp();
  const activeCount = agents.filter((a) => a.status === "working").length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
          </span>
          <span className="text-muted">
            {activeCount} agent{activeCount !== 1 ? "s" : ""} working
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
          <span className="text-sm">📎</span>
          <span className="text-xs font-medium text-foreground">
            {company.name}
          </span>
        </div>
      </div>
    </header>
  );
}
