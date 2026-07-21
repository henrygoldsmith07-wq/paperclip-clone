"use client";

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
  const { tasks, agents, updateTaskStatus, assignTask } = useApp();

  return (
    <>
      <Header title="Tasks" subtitle="Ticket system with full audit trail" />
      <div className="flex-1 overflow-x-auto p-6">
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
