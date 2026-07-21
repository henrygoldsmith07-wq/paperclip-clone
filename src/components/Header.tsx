"use client";

import { useApp } from "@/context/AppContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { company, agents } = useApp();
  const activeCount = agents.filter((a) => a.status === "working").length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-muted hover:bg-card-hover hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
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
          <span className="hidden text-xs font-medium text-foreground sm:inline">
            {company.name}
          </span>
        </div>
      </div>
    </header>
  );
}
