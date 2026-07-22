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
  const { company, agents, isHydrated, simulateTick } = useApp();
  const { toast } = useToast();
  const activeCount = agents.filter((a) => a.status === "working").length;

  const handleSimulate = () => {
    simulateTick();
    toast("⚡ Simulation tick complete", "success");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 pl-16 backdrop-blur-md lg:h-16 lg:px-6 lg:pl-6">
      <div className="min-w-0">
        <h1 className="text-base font-semibold tracking-tight text-foreground truncate lg:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-muted truncate lg:text-xs">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {isHydrated && (
          <>
            <button
              onClick={handleSimulate}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-card-hover hover:border-accent/40"
              title="Simulate one tick (S)"
            >
              ⚡ <span className="hidden sm:inline">Simulate</span>
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
