"use client";

import { useState } from "react";
import Header from "@/components/Header";
import AgentCard from "@/components/AgentCard";
import { Skeleton } from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";
import { AgentRole } from "@/lib/types";

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

export default function AgentsPage() {
  const { agents, hireAgent, isHydrated } = useApp();
  const [showHire, setShowHire] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<AgentRole>("Engineer");
  const [budget, setBudget] = useState(150);
  const [model, setModel] = useState("claude-sonnet-4");

  if (!isHydrated) {
    return (
      <>
        <Header title="Agents" subtitle="Loading agents…" />
        <div className="flex-1 space-y-6 p-6 pt-16 lg:pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        </div>
      </>
    );
  }

  const handleHire = () => {
    if (!name.trim()) return;
    hireAgent({
      name: name.trim(),
      role,
      status: "idle",
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      budgetMonthly: budget,
      skills: [],
      model,
      reportsTo: role === "CEO" ? undefined : "agt-001",
    });
    setName("");
    setShowHire(false);
  };

  return (
    <>
      <Header title="Agents" subtitle="Hire, manage and monitor your AI team" />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {agents.length} agents ·{" "}
            {agents.filter((a) => a.status === "working").length} working
          </p>
          <button
            onClick={() => setShowHire(true)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            + Hire Agent
          </button>
        </div>

        {/* Hire modal */}
        {showHire && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
              <h2 className="text-lg font-semibold">Hire a new agent</h2>
              <p className="mt-1 text-sm text-muted">
                Bring any runtime into your org chart
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nova"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
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
                    <option value="claude-opus-4">Claude Opus 4</option>
                    <option value="claude-sonnet-4">Claude Sonnet 4</option>
                    <option value="gpt-4.1">GPT-4.1</option>
                    <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="local-llama">Local Llama</option>
                  </select>
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
                  className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Hire Agent
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </>
  );
}
