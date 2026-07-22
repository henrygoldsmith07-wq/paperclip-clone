"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { Skeleton } from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";

export default function GoalsPage() {
  const {
    goals,
    agents,
    tasks,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    isHydrated,
  } = useApp();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "completed" | "blocked"
  >("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return goals;
    return goals.filter((g) => g.status === statusFilter);
  }, [goals, statusFilter]);

  if (!isHydrated) {
    return (
      <>
        <Header title="Goals" subtitle="Loading goals…" />
        <div className="flex-1 space-y-6 p-6 pt-16 lg:pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </>
    );
  }

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      description: description.trim(),
      ownerId: ownerId || agents[0]?.id || "",
    });
    toast(`Goal created: ${title.trim()}`, "success");
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
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground">{active.length}</span>{" "}
              active ·{" "}
              <span className="font-medium text-foreground">
                {completed.length}
              </span>{" "}
              completed
            </p>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "active" | "completed" | "blocked"
                )
              }
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-accent"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-hover"
          >
            + New Goal
          </button>
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-2xl">
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
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    autoFocus
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
                    placeholder="What does success look like?"
                    className="mt-1.5 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">Owner</label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
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

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
            <p className="mb-3 text-4xl opacity-60">🎯</p>
            <p className="font-medium text-muted">
              {goals.length === 0 ? "No goals yet" : "No goals match this filter"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {goals.length === 0
                ? "Create your first company goal to give agents direction"
                : "Try a different status filter"}
            </p>
            {goals.length === 0 && (
              <button
                onClick={() => setShowAdd(true)}
                className="mt-4 text-sm font-medium text-accent hover:underline"
              >
                + Create a goal
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((goal) => {
              const owner = agents.find((a) => a.id === goal.ownerId);
              const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
              const statusBar =
                goal.status === "completed"
                  ? "bg-success"
                  : goal.status === "blocked"
                    ? "bg-danger"
                    : "bg-accent";
              const progressColor =
                goal.progress >= 100
                  ? "bg-success"
                  : goal.progress >= 60
                    ? "bg-accent"
                    : "bg-accent/80";

              return (
                <div
                  key={goal.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-black/15"
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-0.5 ${statusBar} opacity-50 transition-opacity group-hover:opacity-80`}
                  />

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
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                          {goal.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                        {owner && (
                          <span className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px]">
                              {owner.avatar}
                            </span>
                            {owner.name}
                          </span>
                        )}
                        {goal.dueDate && (
                          <span className="tabular-nums">Due {goal.dueDate}</span>
                        )}
                        <span>
                          {linkedTasks.length} linked task
                          {linkedTasks.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-2xl font-semibold tabular-nums text-accent">
                        {goal.progress}%
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete goal "${goal.title}"?`)) {
                            deleteGoal(goal.id);
                            toast("Goal deleted", "warning");
                          }
                        }}
                        className="mt-1 text-[10px] text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={goal.progress}
                        onChange={(e) =>
                          updateGoalProgress(goal.id, Number(e.target.value))
                        }
                        className="h-1.5 flex-1 cursor-pointer accent-accent"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            updateGoalProgress(
                              goal.id,
                              Math.max(0, goal.progress - 5)
                            )
                          }
                          className="rounded-md px-1.5 py-0.5 text-[10px] text-muted hover:bg-card-hover"
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
                          className="rounded-md px-1.5 py-0.5 text-[10px] text-muted hover:bg-card-hover"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => {
                            updateGoalProgress(goal.id, 100);
                            toast(`Goal completed: ${goal.title}`, "success");
                          }}
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-success hover:bg-success/10"
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
