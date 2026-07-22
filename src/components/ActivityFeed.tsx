"use client";

import { Activity } from "@/lib/types";
import { useApp } from "@/context/AppContext";

const typeIcons: Record<Activity["type"], string> = {
  heartbeat: "💓",
  task_started: "▶️",
  task_completed: "✅",
  budget_alert: "💰",
  goal_update: "🎯",
  hire: "👋",
  message: "💬",
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ActivityFeed({ limit = 8 }: { limit?: number }) {
  const { activities, agents } = useApp();
  const items = activities.slice(0, limit);

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-3xl mb-2 opacity-40">📡</p>
        <p className="text-sm text-muted">No activity yet</p>
        <p className="mt-1 text-xs text-muted">
          Try the Simulate Tick button!
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical timeline line */}
      <div className="absolute bottom-3 left-[21px] top-3 w-px bg-border" />

      {items.map((act, idx) => {
        const agent = agents.find((a) => a.id === act.agentId);
        const isFirst = idx === 0;
        return (
          <div
            key={act.id}
            className={`relative flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-card-hover ${isFirst ? "animate-fade-in" : ""}`}
          >
            <span
              className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-sm"
              aria-hidden
            >
              {typeIcons[act.type] || "•"}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm leading-snug text-foreground/90">
                {act.message}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {agent ? (
                  <span>
                    {agent.avatar} {agent.name} ·{" "}
                  </span>
                ) : null}
                <span className="tabular-nums">{timeAgo(act.timestamp)}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
