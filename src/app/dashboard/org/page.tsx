"use client";

import type { ReactNode } from "react";
import Header from "@/components/Header";
import { Skeleton } from "@/components/Skeleton";
import { useApp } from "@/context/AppContext";
import { Agent } from "@/lib/types";

function AgentNode({
  agent,
  children,
}: {
  agent: Agent;
  children?: ReactNode;
}) {
  const statusColor =
    agent.status === "working"
      ? "border-success/50 bg-success/10 shadow-success/5"
      : agent.status === "paused"
        ? "border-warning/50 bg-warning/10"
        : agent.status === "error"
          ? "border-danger/50 bg-danger/10"
          : "border-border bg-card";

  const statusDot =
    agent.status === "working"
      ? "bg-success"
      : agent.status === "paused"
        ? "bg-warning"
        : agent.status === "error"
          ? "bg-danger"
          : "bg-zinc-500";

  const ringColor =
    agent.status === "working"
      ? "ring-success/30"
      : agent.status === "paused"
        ? "ring-warning/30"
        : agent.status === "error"
          ? "ring-danger/30"
          : "ring-zinc-600/30";

  const hasChildren =
    children != null && !(Array.isArray(children) && children.length === 0);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`group relative flex w-40 sm:w-44 flex-col items-center rounded-xl border-2 p-4 shadow-sm transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-black/20 ${statusColor}`}
      >
        <span
          className={`absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-background ${statusDot} ${
            agent.status === "working" ? "animate-pulse-dot" : ""
          }`}
          title={agent.status}
        />

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-2xl ring-2 ${ringColor}`}
        >
          {agent.avatar}
        </div>

        <div className="mt-2.5 text-center text-sm font-semibold leading-tight">
          {agent.name}
        </div>
        <div className="mt-0.5 text-[11px] font-medium text-muted">
          {agent.role}
        </div>
        <div className="mt-1 max-w-full truncate px-1 font-mono text-[10px] text-muted/70">
          {agent.model}
        </div>

        <div className="pointer-events-none absolute -bottom-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-zinc-900 px-2.5 py-1 text-[10px] text-muted opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100">
          ${agent.budgetSpent.toFixed(0)} / ${agent.budgetMonthly} spent
        </div>
      </div>

      {hasChildren && (
        <>
          <div className="h-6 w-px bg-gradient-to-b from-border to-border/40" />
          <div className="flex flex-wrap justify-center gap-5 sm:gap-8">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgPage() {
  const { agents, isHydrated } = useApp();

  if (!isHydrated) {
    return (
      <>
        <Header title="Org Chart" subtitle="Loading hierarchy…" />
        <div className="flex-1 overflow-auto p-6 pt-16 lg:p-8 lg:pt-8">
          <div className="flex min-w-max flex-col items-center gap-6 pb-8">
            <Skeleton className="h-28 w-44 rounded-xl" />
            <div className="h-5 w-px bg-border" />
            <div className="flex gap-6">
              <Skeleton className="h-28 w-40 rounded-xl" />
              <Skeleton className="h-28 w-40 rounded-xl" />
              <Skeleton className="h-28 w-40 rounded-xl" />
            </div>
          </div>
        </div>
      </>
    );
  }

  const ceo = agents.find((a) => a.role === "CEO") || agents[0];
  // Never include the root node as its own report
  const directReports = agents.filter(
    (a) =>
      a.id !== ceo?.id &&
      (a.reportsTo === ceo?.id || (!a.reportsTo && a.role !== "CEO"))
  );
  const getReports = (id: string) =>
    agents.filter((a) => a.reportsTo === id && a.id !== id);

  return (
    <>
      <Header
        title="Org Chart"
        subtitle="Hierarchies, roles, reporting lines & governance"
      />
      <div className="flex-1 overflow-auto p-6 pt-16 lg:p-8 lg:pt-8">
        {agents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
            <p className="mb-3 text-4xl opacity-60">🏢</p>
            <p className="font-medium text-muted">No agents yet</p>
            <p className="mt-1 text-sm text-muted">
              Hire some from the Agents page to build your org chart
            </p>
          </div>
        ) : (
          <div className="flex min-w-max flex-col items-center pb-10">
            {ceo && (
              <AgentNode agent={ceo}>
                {directReports.map((report) => {
                  const subReports = getReports(report.id);
                  return (
                    <AgentNode key={report.id} agent={report}>
                      {subReports.map((sub) => (
                        <AgentNode key={sub.id} agent={sub} />
                      ))}
                    </AgentNode>
                  );
                })}
              </AgentNode>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 rounded-xl border border-border bg-card/50 px-5 py-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            Working
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
            Idle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
            Paused
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger" />
            Error
          </span>
        </div>
      </div>
    </>
  );
}
