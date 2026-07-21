"use client";

import { useApp } from "@/context/AppContext";

export default function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { company, agents, isHydrated } = useApp();
  const activeCount = agents.filter((a) => a.status === "working").length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 pl-16 backdrop-blur-md lg:px-6 lg:pl-6">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isHydrated && (
          <div className="hidden items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-muted">
              {activeCount} agent{activeCount !== 1 ? "s" : ""} working
            </span>
          </div>
        )}
        <div className="hidden text-xs text-muted md:block">
          {company.name}
        </div>
      </div>
    </header>
  );
}
