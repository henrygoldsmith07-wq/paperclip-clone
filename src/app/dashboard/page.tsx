"use client";

import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import ActivityFeed from "@/components/ActivityFeed";
import { DashboardSkeleton } from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/components/Toast";
import Link from "next/link";

export default function DashboardPage() {
  const {
    agents,
    goals,
    tasks,
    company,
    resetData,
    clearActivities,
    isHydrated,
  } = useApp();
  const { toast } = useToast();

  if (!isHydrated) {
    return (
      <>
        <Header title="Dashboard" subtitle="Loading mission control…" />
        <DashboardSkeleton />
      </>
    );
  }

  const working = agents.filter((a) => a.status === "working").length;
  const totalBudget = agents.reduce((s, a) => s + a.budgetMonthly, 0);
  const spent = agents.reduce((s, a) => s + a.budgetSpent, 0);
  const avgProgress =
    goals.length > 0
      ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
      : 0;
  const openTasks = tasks.filter(
    (t) => t.status !== "done" && t.status !== "backlog"
  ).length;

  const budgetAlerts = agents
    .map((a) => ({
      ...a,
      pct: a.budgetMonthly > 0 ? a.budgetSpent / a.budgetMonthly : 0,
    }))
    .filter((a) => a.pct >= 0.7)
    .sort((a, b) => b.pct - a.pct);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={`${company.name} · Mission control for your AI team`}
      />
      <div className="flex-1 space-y-6 p-6 pt-16 lg:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Live overview of your autonomous company
          </p>
          <button
            onClick={() => {
              if (confirm("Reset all data to the original demo company?")) {
                resetData();
                toast("Demo data reset", "warning");
              }
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-card-hover hover:text-foreground"
          >
            Reset Demo
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Agents"
            value={`${working} / ${agents.length}`}
            sub="Currently working"
            icon="🤖"
            accent="green"
          />
          <StatCard
            label="Monthly Budget"
            value={`$${spent.toFixed(0)}`}
            sub={`of $${totalBudget} used`}
            icon="💰"
            accent={spent / (totalBudget || 1) > 0.8 ? "red" : "blue"}
          />
          <StatCard
            label="Goal Progress"
            value={`${avgProgress}%`}
            sub={`${goals.filter((g) => g.status === "active").length} active goals`}
            icon="🎯"
            accent="blue"
          />
          <StatCard
            label="Open Tasks"
            value={openTasks}
            sub={`${tasks.filter((t) => t.status === "done").length} completed`}
            icon="✅"
            accent="amber"
          />
        </div>

        {budgetAlerts.length > 0 && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <h2 className="text-sm font-semibold text-warning">
                Budget alerts
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {budgetAlerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs"
                >
                  <span>{a.avatar}</span>
                  <span className="font-medium">{a.name}</span>
                  <span
                    className={
                      a.pct >= 0.85 ? "text-danger" : "text-warning"
                    }
                  >
                    {Math.round(a.pct * 100)}%
                  </span>
                  <span className="text-muted">
                    ${a.budgetSpent.toFixed(0)} / ${a.budgetMonthly}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Company Mission
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {company.mission}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Active Goals
                </h2>
                <Link
                  href="/dashboard/goals"
                  className="text-xs font-medium text-accent hover:text-accent-hover"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-4">
                {goals
                  .filter((g) => g.status === "active")
                  .slice(0, 3)
                  .map((goal) => (
                    <div key={goal.id}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">
                          {goal.title}
                        </span>
                        <span className="text-xs tabular-nums text-muted">
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                {goals.filter((g) => g.status === "active").length === 0 && (
                  <p className="text-sm text-muted">No active goals</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                Live Activity
              </h2>
              <button
                onClick={() => {
                  clearActivities();
                  toast("Activity cleared", "info");
                }}
                className="text-[11px] text-muted hover:text-foreground"
              >
                Clear
              </button>
            </div>
            <div className="p-2">
              <ActivityFeed limit={8} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard/agents"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/40 hover:bg-card-hover"
          >
            <span className="text-2xl">🤖</span>
            <div>
              <div className="text-sm font-medium">Manage Agents</div>
              <div className="text-xs text-muted">Hire, pause, budgets</div>
            </div>
          </Link>
          <Link
            href="/dashboard/tasks"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/40 hover:bg-card-hover"
          >
            <span className="text-2xl">✅</span>
            <div>
              <div className="text-sm font-medium">Task Board</div>
              <div className="text-xs text-muted">Assign & track work</div>
            </div>
          </Link>
          <Link
            href="/dashboard/org"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/40 hover:bg-card-hover"
          >
            <span className="text-2xl">🏢</span>
            <div>
              <div className="text-sm font-medium">Org Chart</div>
              <div className="text-xs text-muted">Hierarchy & reporting</div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
