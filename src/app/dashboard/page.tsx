"use client";

import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import ActivityFeed from "@/components/ActivityFeed";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function DashboardPage() {
  const { agents, goals, tasks, company } = useApp();

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

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={`${company.name} · Mission control for your AI team`}
      />
      <div className="flex-1 space-y-6 p-6">
        {/* Stats */}
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
            accent={spent / totalBudget > 0.8 ? "red" : "blue"}
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

        {/* Mission + Activity */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Mission & Goals */}
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
                        <span className="text-xs text-muted">
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-border bg-card lg:col-span-2">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                Live Activity
              </h2>
            </div>
            <div className="p-2">
              <ActivityFeed limit={7} />
            </div>
          </div>
        </div>

        {/* Quick links */}
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
