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
      <p className="py-10 text-center text-sm text-muted">
        No activity yet. Try the Simulate Tick button!
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {items.map((act) => {
        const agent = agents.find((a) => a.id === act.agentId);
        return (
          <div
            key={act.id}
            className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-card-hover"
          >
            <span className="mt-0.5 text-base shrink-0" aria-hidden>
              {typeIcons[act.type] || "•"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground/90 leading-snug">
                {act.message}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                {agent ? (
                  <span>
                    {agent.avatar} {agent.name} ·{" "}
                  </span>
                ) : null}
                {timeAgo(act.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
