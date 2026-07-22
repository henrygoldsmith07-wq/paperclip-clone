"use client";

import { Agent } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";

const statusStyles: Record<
  Agent["status"],
  { bg: string; text: string; label: string; ring: string }
> = {
  working: {
    bg: "bg-success/15",
    text: "text-success",
    label: "Working",
    ring: "ring-success/20",
  },
  idle: {
    bg: "bg-zinc-500/15",
    text: "text-zinc-400",
    label: "Idle",
    ring: "ring-zinc-500/10",
  },
  paused: {
    bg: "bg-warning/15",
    text: "text-warning",
    label: "Paused",
    ring: "ring-warning/20",
  },
  error: {
    bg: "bg-danger/15",
    text: "text-danger",
    label: "Error",
    ring: "ring-danger/20",
  },
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AgentCard({ agent }: { agent: Agent }) {
  const { updateAgentStatus, deleteAgent } = useApp();
  const { toast } = useToast();
  const style = statusStyles[agent.status];
  const budgetPct = Math.min(
    100,
    Math.round((agent.budgetSpent / (agent.budgetMonthly || 1)) * 100)
  );

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/30 hover:bg-card-hover hover:shadow-lg hover:shadow-black/20">
      {agent.status === "working" && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-success/60" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xl ring-2 ${style.ring}`}
          >
            {agent.avatar}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">
              {agent.name}
            </h3>
            <p className="text-xs text-muted">{agent.role}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}
        >
          {agent.status === "working" && (
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
          )}
          {style.label}
        </span>
      </div>

      {agent.currentTask && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted">
          <span className="font-medium text-foreground/70">Working on:</span>{" "}
          {agent.currentTask}
        </p>
      )}

      {agent.skills && agent.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agent.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-muted"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-[11px]">
          <span className="text-muted">Budget</span>
          <span
            className={
              budgetPct > 85
                ? "font-medium text-danger"
                : budgetPct > 60
                  ? "text-warning"
                  : "text-foreground"
            }
          >
            ${agent.budgetSpent.toFixed(0)}{" "}
            <span className="text-muted">/ ${agent.budgetMonthly}</span>
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetPct > 85
                ? "bg-danger"
                : budgetPct > 60
                  ? "bg-warning"
                  : "bg-accent"
            }`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-[11px] text-muted">
        <span className="max-w-[55%] truncate font-mono text-[10px]">
          {agent.model}
        </span>
        <span title={agent.lastHeartbeat} className="tabular-nums">
          ♥ {timeAgo(agent.lastHeartbeat)}
        </span>
      </div>

      <div className="mt-4 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        {agent.status !== "working" && (
          <button
            onClick={() => {
              updateAgentStatus(agent.id, "working");
              toast(`${agent.name} resumed`, "success");
            }}
            className="flex-1 rounded-md bg-accent/15 px-2 py-1.5 text-[11px] font-medium text-accent hover:bg-accent/25"
          >
            Resume
          </button>
        )}
        {agent.status === "working" && (
          <button
            onClick={() => {
              updateAgentStatus(agent.id, "paused");
              toast(`${agent.name} paused`, "warning");
            }}
            className="flex-1 rounded-md bg-warning/15 px-2 py-1.5 text-[11px] font-medium text-warning hover:bg-warning/25"
          >
            Pause
          </button>
        )}
        {agent.status !== "idle" && (
          <button
            onClick={() => {
              updateAgentStatus(agent.id, "idle");
              toast(`${agent.name} set to idle`, "info");
            }}
            className="flex-1 rounded-md bg-zinc-700/50 px-2 py-1.5 text-[11px] font-medium text-muted hover:bg-zinc-700"
          >
            Idle
          </button>
        )}
        {agent.role !== "CEO" && (
          <button
            onClick={() => {
              if (confirm(`Remove ${agent.name} from the team?`)) {
                deleteAgent(agent.id);
                toast(`${agent.name} removed`, "warning");
              }
            }}
            className="rounded-md bg-danger/15 px-2.5 py-1.5 text-[11px] font-medium text-danger hover:bg-danger/25"
            title="Remove agent"
            aria-label={`Remove ${agent.name}`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
