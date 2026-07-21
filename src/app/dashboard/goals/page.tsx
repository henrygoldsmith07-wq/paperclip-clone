"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useApp } from "@/context/AppContext";

export default function GoalsPage() {
  const { goals, agents, addGoal, updateGoalProgress, isHydrated } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState(agents[0]?.id || "");

  if (!isHydrated) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-muted">
        Loading goals…
      </div>
    );
  }

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      description: description.trim(),
      ownerId,
    });
    setTitle("");
    setDescription("");
    setShowAdd(false);
  };

  return (
    <>
      <Header title="Goals" subtitle="Every task traces back to the mission" />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {goals.filter((g) => g.status === "active").length} active ·{" "}
            {goals.filter((g) => g.status === "completed").length} completed
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            + New Goal
          </button>
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
              <h2 className="text-lg font-semibold">Create a new goal</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Ship v2 of the platform"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">Owner</label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.avatar} {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {goals.map((goal) => {
            const owner = agents.find((a) => a.id === goal.ownerId);
            return (
              <div
                key={goal.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {goal.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          goal.status === "completed"
                            ? "bg-success/15 text-success"
                            : goal.status === "blocked"
                              ? "bg-danger/15 text-danger"
                              : "bg-accent/15 text-accent"
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{goal.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                      {owner && (
                        <span>
                          {owner.avatar} {owner.name}
                        </span>
                      )}
                      {goal.dueDate && <span>Due {goal.dueDate}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-accent">
                      {goal.progress}%
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    {[0, 25, 50, 75, 100].map((p) => (
                      <button
                        key={p}
                        onClick={() => updateGoalProgress(goal.id, p)}
                        className="rounded px-2 py-0.5 text-[10px] text-muted hover:bg-card-hover hover:text-foreground"
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
