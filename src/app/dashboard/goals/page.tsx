"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useApp } from "@/context/AppContext";

export default function GoalsPage() {
  const { goals, agents, addGoal, updateGoalProgress, deleteGoal, isHydrated } =
    useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("");

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
      ownerId: ownerId || agents[0]?.id || "",
    });
    setTitle("");
    setDescription("");
    setOwnerId("");
    setShowAdd(false);
  };

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");

  return (
    <>
      <Header title="Goals" subtitle="Every task traces back to the mission" />
      <div className="flex-1 space-y-6 p-6 pt-16 lg:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {active.length} active · {completed.length} completed
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
              <p className="mt-1 text-sm text-muted">
                Goals give agents direction and measurable outcomes
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Launch v1 of the product"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="What does success look like?"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent resize-y"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">Owner</label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  >
                    <option value="">Select agent…</option>
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
                  disabled={!title.trim()}
                  className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-20 text-center">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-muted">No goals yet</p>
            <p className="mt-1 text-sm text-muted">
              Create your first company goal to give agents direction
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 text-sm text-accent hover:underline"
            >
              + Create a goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const owner = agents.find((a) => a.id === goal.ownerId);
              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
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
                      {goal.description && (
                        <p className="mt-1.5 text-sm text-muted leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                        {owner && (
                          <span>
                            {owner.avatar} {owner.name}
                          </span>
                        )}
                        {goal.dueDate && <span>Due {goal.dueDate}</span>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-semibold text-accent tabular-nums">
                        {goal.progress}%
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete goal "${goal.title}"?`)) {
                            deleteGoal(goal.id);
                          }
                        }}
                        className="mt-1 text-[10px] text-muted hover:text-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={goal.progress}
                        onChange={(e) =>
                          updateGoalProgress(goal.id, Number(e.target.value))
                        }
                        className="flex-1 h-1.5 accent-accent cursor-pointer"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            updateGoalProgress(
                              goal.id,
                              Math.max(0, goal.progress - 5)
                            )
                          }
                          className="rounded px-1.5 py-0.5 text-[10px] text-muted hover:bg-card-hover"
                        >
                          −5
                        </button>
                        <button
                          onClick={() =>
                            updateGoalProgress(
                              goal.id,
                              Math.min(100, goal.progress + 5)
                            )
                          }
                          className="rounded px-1.5 py-0.5 text-[10px] text-muted hover:bg-card-hover"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => updateGoalProgress(goal.id, 100)}
                          className="rounded px-1.5 py-0.5 text-[10px] text-success hover:bg-success/10"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
