"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import AgentCard from "@/components/AgentCard";
import { Skeleton } from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";
import { AgentRole, AgentStatus } from "@/lib/types";
import { modelsByGroup } from "@/lib/llm";

const ROLES: AgentRole[] = [
  "CEO",
  "CTO",
  "CMO",
  "CFO",
  "Engineer",
  "Designer",
  "Sales",
  "Support",
  "Researcher",
  "Writer",
];

const AVATARS = ["⚡", "🛡️", "📣", "💰", "⚙️", "🎨", "💼", "🎧", "🔬", "✍️", "🚀", "🧠"];

const MODEL_GROUPS = modelsByGroup();

export default function AgentsPage() {
  const { agents, hireAgent, setAllAgentsStatus, isHydrated } = useApp();
  const { toast } = useToast();
  const [showHire, setShowHire] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<AgentRole>("Engineer");
  const [budget, setBudget] = useState(150);
  const [model, setModel] = useState("claude-sonnet-4");
  const [skills, setSkills] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AgentStatus | "all">("all");

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const matchesSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase()) ||
        a.model.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [agents, search, statusFilter]);

  const handleHire = () => {
    if (!name.trim()) return;
    hireAgent({
      name: name.trim(),
      role,
      status: "idle",
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      budgetMonthly: budget,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      model,
    });
    toast(`${name.trim()} hired`, "success");
    setName("");
    setSkills("");
    setShowHire(false);
  };

  if (!isHydrated) {
    return (
      <>
        <Header title="Agents" subtitle="Loading team…" />
        <div className="flex-1 space-y-6 p-6 pt-16 lg:pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-4 w-40" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Agents" subtitle="Hire, manage and monitor your AI team" />
      <div className="flex-1 space-y-6 p-6 pt-16 lg:pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as AgentStatus | "all")
              }
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="all">All statuses</option>
              <option value="working">Working</option>
              <option value="idle">Idle</option>
              <option value="paused">Paused</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setAllAgentsStatus("paused");
                toast("All agents paused", "warning");
              }}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:bg-card-hover hover:text-foreground"
            >
              Pause all
            </button>
            <button
              onClick={() => {
                setAllAgentsStatus("working");
                toast("All agents resumed", "success");
              }}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:bg-card-hover hover:text-foreground"
            >
              Resume all
            </button>
            <button
              onClick={() => setShowHire(true)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              + Hire Agent
            </button>
          </div>
        </div>

        <p className="text-sm text-muted">
          Showing {filtered.length} of {agents.length} agents ·{" "}
          {agents.filter((a) => a.status === "working").length} working
        </p>

        {showHire && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <h2 className="text-lg font-semibold">Hire a new agent</h2>
              <p className="mt-1 text-sm text-muted">
                Pick any top or free model — set the matching API key in Settings
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nova"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AgentRole)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">
                    Monthly Budget ($)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  >
                    {MODEL_GROUPS.map(({ group, models }) => (
                      <optgroup key={group} label={group}>
                        {models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                            {m.tier === "free" ? " · free" : ""}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">
                    Skills (comma-separated)
                  </label>
                  <input
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. TypeScript, Design Systems, Sales"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowHire(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  onClick={handleHire}
                  disabled={!name.trim()}
                  className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
                >
                  Hire Agent
                </button>
              </div>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
            <p className="mb-3 text-4xl opacity-50">🤖</p>
            <p className="font-medium text-muted">No agents match your filters</p>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-3 text-sm font-medium text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
