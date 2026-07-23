"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { Skeleton } from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";
import { Task } from "@/lib/types";

const columns: {
  key: Task["status"];
  label: string;
  accent: string;
}[] = [
  { key: "backlog", label: "Backlog", accent: "bg-zinc-500" },
  { key: "todo", label: "To Do", accent: "bg-blue-500" },
  { key: "in_progress", label: "In Progress", accent: "bg-accent" },
  { key: "review", label: "Review", accent: "bg-warning" },
  { key: "done", label: "Done", accent: "bg-success" },
];

const priorityColors: Record<Task["priority"], string> = {
  low: "bg-zinc-500/20 text-zinc-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-amber-500/20 text-amber-400",
  critical: "bg-red-500/20 text-red-400",
};

export default function TasksPage() {
  const {
    tasks,
    agents,
    goals,
    updateTaskStatus,
    assignTask,
    createTask,
    deleteTask,
    isHydrated,
  } = useApp();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [goalId, setGoalId] = useState("");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    Task["priority"] | "all"
  >("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [expandedOutput, setExpandedOutput] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.lastOutput || "").toLowerCase().includes(q);
      const matchesPriority =
        priorityFilter === "all" || t.priority === priorityFilter;
      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "unassigned" && !t.assigneeId) ||
        t.assigneeId === assigneeFilter;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, search, priorityFilter, assigneeFilter]);

  if (!isHydrated) {
    return (
      <>
        <Header title="Tasks" subtitle="Loading tasks…" />
        <div className="flex-1 overflow-x-auto p-6 pt-16 lg:pt-6">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex min-w-max gap-4">
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex w-72 flex-col rounded-xl border border-border bg-card"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-6 rounded-full" />
                </div>
                <div className="space-y-2 p-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createTask({
      title: title.trim(),
      description: description.trim() || "No description",
      priority,
      assigneeId: assigneeId || undefined,
      goalId: goalId || undefined,
      status: "backlog",
    });
    toast(`Task created: ${title.trim()}`, "success");
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssigneeId("");
    setGoalId("");
    setShowForm(false);
  }

  return (
    <>
      <Header title="Tasks" subtitle="Assign work · agents run with your API keys" />
      <div className="flex-1 overflow-x-auto p-6 pt-16 lg:pt-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              type="search"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-accent"
            />
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as Task["priority"] | "all")
              }
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-accent"
            >
              <option value="all">All priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-accent"
            >
              <option value="all">All assignees</option>
              <option value="unassigned">Unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.avatar} {a.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted">
              {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-lg bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-90"
          >
            {showForm ? "Cancel" : "+ New Task"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 grid animate-fade-in gap-3 rounded-xl border border-border bg-card p-5 shadow-lg shadow-black/10 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                required
                autoFocus
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details…"
                rows={2}
                className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Task["priority"])
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.avatar} {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Linked Goal
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="">None</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Create Task
              </button>
            </div>
          </form>
        )}

        <div className="flex min-w-max gap-4 pb-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="flex w-72 flex-col overflow-hidden rounded-xl border border-border bg-card/80"
              >
                <div className="relative flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.accent}`} />
                    <h3 className="text-sm font-semibold">{col.label}</h3>
                  </div>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted">
                    {colTasks.length}
                  </span>
                </div>

                <div className="min-h-[120px] flex-1 space-y-2 overflow-y-auto p-3">
                  {colTasks.map((task) => {
                    const assignee = agents.find(
                      (a) => a.id === task.assigneeId
                    );
                    const linkedGoal = goals.find((g) => g.id === task.goalId);
                    const isOpen = expandedOutput === task.id;
                    return (
                      <div
                        key={task.id}
                        className="group rounded-lg border border-border bg-background p-3.5 shadow-sm transition-all hover:border-accent/40 hover:shadow-md hover:shadow-black/10"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug text-foreground">
                            {task.title}
                          </p>
                          <div className="flex shrink-0 items-center gap-1">
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize ${priorityColors[task.priority]}`}
                            >
                              {task.priority}
                            </span>
                            <button
                              onClick={() => {
                                if (confirm(`Delete task "${task.title}"?`)) {
                                  deleteTask(task.id);
                                  toast("Task deleted", "warning");
                                }
                              }}
                              className="rounded px-1.5 py-0.5 text-[10px] text-muted opacity-0 transition-opacity hover:bg-danger/15 hover:text-danger group-hover:opacity-100"
                              title="Delete task"
                              aria-label={`Delete ${task.title}`}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {task.description &&
                          task.description !== "No description" && (
                            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
                              {task.description}
                            </p>
                          )}

                        {linkedGoal && (
                          <p className="mt-2 truncate text-[10px] text-accent/80">
                            🎯 {linkedGoal.title}
                          </p>
                        )}

                        {task.lastOutput && (
                          <div className="mt-2 rounded-md border border-border/80 bg-zinc-900/50 p-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedOutput(isOpen ? null : task.id)
                              }
                              className="text-left text-[10px] font-medium text-accent hover:underline"
                            >
                              {isOpen ? "Hide agent output" : "Show agent output"}
                            </button>
                            {isOpen && (
                              <pre className="mt-1.5 max-h-40 overflow-y-auto whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-muted">
                                {task.lastOutput}
                              </pre>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-2">
                          {assignee ? (
                            <span className="flex items-center gap-1.5 text-xs text-muted">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px]">
                                {assignee.avatar}
                              </span>
                              {assignee.name}
                            </span>
                          ) : (
                            <select
                              className="rounded-md border border-border bg-card px-1.5 py-1 text-[11px] text-muted outline-none hover:border-accent/40"
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value)
                                  assignTask(task.id, e.target.value);
                              }}
                            >
                              <option value="" disabled>
                                Assign…
                              </option>
                              {agents.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name}
                                </option>
                              ))}
                            </select>
                          )}
                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(
                                task.id,
                                e.target.value as Task["status"]
                              )
                            }
                            className="rounded-md border border-border bg-card px-1.5 py-1 text-[11px] outline-none hover:border-accent/40"
                          >
                            {columns.map((c) => (
                              <option key={c.key} value={c.key}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-xs text-muted/70">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
