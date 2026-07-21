"use client";

import { Agent } from "@/lib/types";
import { useApp } from "@/context/AppContext";

const statusStyles: Record<
  Agent["status"],
  { bg: string; text: string; label: string }
> = {
  working: { bg: "bg-success/15", text: "text-success", label: "Working" },
  idle: { bg: "bg-zinc-500/15", text: "text-zinc-400", label: "Idle" },
  paused: { bg: "bg-warning/15", text: "text-warning", label: "Paused" },
  error: { bg: "bg-danger/15", text: "text-danger", label: "Error" },
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AgentCard({ agent }: { agent: Agent }) {
  const { updateAgentStatus } = useApp();
  const style = statusStyles[agent.status];
  const budgetPct = Math.round(
    (agent.budgetSpent / agent.budgetMonthly) * 100
  );

  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/30 hover:bg-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-xl">
            {agent.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{agent.name}</h3>
            <p className="text-xs text-muted">{agent.role}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}
        >
          {agent.status === "working" && (
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
          )}
          {style.label}
        </span>
      </div>

      {agent.currentTask && (
        <p className="mt-3 line-clamp-2 text-xs text-muted">
          <span className="text-foreground/70">Working on:</span>{" "}
          {agent.currentTask}
        </p>
      )}

      {/* Budget bar */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[11px]">
          <span className="text-muted">Budget</span>
          <span className="text-foreground">
            ${agent.budgetSpent.toFixed(0)} / ${agent.budgetMonthly}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all ${
              budgetPct > 85
                ? "bg-danger"
                : budgetPct > 60
                  ? "bg-warning"
                  : "bg-accent"
            }`}
            style={{ width: `${Math.min(100, budgetPct)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-muted">
        <span>Model: {agent.model}</span>
        <span>♥ {timeAgo(agent.lastHeartbeat)}</span>
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        {agent.status !== "working" && (
          <button
            onClick={() => updateAgentStatus(agent.id, "working")}
            className="flex-1 rounded-md bg-accent/15 px-2 py-1.5 text-[11px] font-medium text-accent hover:bg-accent/25"
          >
            Resume
          </button>
        )}
        {agent.status === "working" && (
          <button
            onClick={() => updateAgentStatus(agent.id, "paused")}
            className="flex-1 rounded-md bg-warning/15 px-2 py-1.5 text-[11px] font-medium text-warning hover:bg-warning/25"
          >
            Pause
          </button>
        )}
        {agent.status !== "idle" && (
          <button
            onClick={() => updateAgentStatus(agent.id, "idle")}
            className="flex-1 rounded-md bg-zinc-700/50 px-2 py-1.5 text-[11px] font-medium text-muted hover:bg-zinc-700"
          >
            Idle
          </button>
        )}
      </div>
    </div>
  );
}
