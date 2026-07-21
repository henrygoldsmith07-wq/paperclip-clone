"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useApp } from "@/context/AppContext";
import { Task } from "@/lib/types";

const columns: { key: Task["status"]; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

const priorityColors: Record<Task["priority"], string> = {
  low: "bg-zinc-500/20 text-zinc-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-amber-500/20 text-amber-400",
  critical: "bg-red-500/20 text-red-400",
};

export default function TasksPage() {
  const { tasks, agents, goals, updateTaskStatus, assignTask, addTask } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [goalId, setGoalId] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim(),
      status: "backlog",
      priority,
      assigneeId: assigneeId || undefined,
      goalId: goalId || undefined,
    });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssigneeId("");
    setGoalId("");
    setShowAdd(false);
  };

  return (
    <>
      <Header title="Tasks" subtitle="Ticket system with full audit trail" />
      <div className="flex-1 overflow-x-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            {tasks.filter((t) => t.status !== "done").length} open ·{" "}
            {tasks.filter((t) => t.status === "done").length} done
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            + New Task
          </button>
        </div>

        {/* Create Task modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
              <h2 className="text-lg font-semibold">Create a new task</h2>
              <p className="mt-1 text-sm text-muted">
                Add work for your agents to pick up
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Implement budget alerts"
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
                    placeholder="Details and acceptance criteria…"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as Task["priority"])
                      }
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted">
                      Assign to
                    </label>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    >
                      <option value="">Unassigned</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.avatar} {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted">
                    Linked Goal (optional)
                  </label>
                  <select
                    value={goalId}
                    onChange={(e) => setGoalId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  >
                    <option value="">None</option>
                    {goals
                      .filter((g) => g.status === "active")
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
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
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex min-w-max gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="flex w-72 flex-col rounded-xl border border-border bg-card"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-muted">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto p-3">
                  {colTasks.map((task) => {
                    const assignee = agents.find(
                      (a) => a.id === task.assigneeId
                    );
                    return (
                      <div
                        key={task.id}
                        className="rounded-lg border border-border bg-background p-3 transition-colors hover:border-accent/30"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">
                            {task.title}
                          </p>
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[task.priority]}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-xs text-muted">
                          {task.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          {assignee ? (
                            <span className="text-xs text-muted">
                              {assignee.avatar} {assignee.name}
                            </span>
                          ) : (
                            <select
                              className="rounded border border-border bg-card px-1.5 py-0.5 text-[11px] text-muted outline-none"
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
                            className="rounded border border-border bg-card px-1.5 py-0.5 text-[11px] outline-none"
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
                    <p className="py-6 text-center text-xs text-muted">
                      No tasks
                    </p>
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
