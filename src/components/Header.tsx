"use client";

import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";

export default function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { company, agents, isHydrated, isProcessing, processWork } = useApp();
  const { toast } = useToast();
  const activeCount = agents.filter((a) => a.status === "working").length;

  const handleProcess = async () => {
    const result = await processWork();
    toast(result.message, result.ok ? "success" : "warning");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 pl-16 backdrop-blur-md lg:h-16 lg:px-6 lg:pl-6">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold tracking-tight text-foreground lg:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[11px] text-muted lg:text-xs">{subtitle}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {isHydrated && (
          <>
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm hover:border-accent/40 hover:bg-card-hover disabled:cursor-wait disabled:opacity-60"
              title="Run assigned agent on next task (W)"
            >
              {isProcessing ? (
                <>
                  <span className="inline-block animate-pulse">⏳</span>{" "}
                  <span className="hidden sm:inline">Running…</span>
                </>
              ) : (
                <>
                  ▶ <span className="hidden sm:inline">Process Work</span>
                </>
              )}
            </button>

            <div className="hidden items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs shadow-sm sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-muted">
                <span className="font-medium text-foreground">{activeCount}</span>{" "}
                working
              </span>
            </div>
          </>
        )}
        <div className="hidden rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] text-muted md:block">
          {company.name}
        </div>
      </div>
    </header>
  );
}
