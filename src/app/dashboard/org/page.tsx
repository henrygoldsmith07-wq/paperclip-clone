"use client";

import Header from "@/components/Header";
import { useApp } from "@/context/AppContext";
import { Agent } from "@/lib/types";

function AgentNode({
  agent,
  children,
}: {
  agent: Agent;
  children?: React.ReactNode;
}) {
  const statusColor =
    agent.status === "working"
      ? "border-success/60 bg-success/10 shadow-success/10"
      : agent.status === "paused"
        ? "border-warning/60 bg-warning/10"
        : agent.status === "error"
          ? "border-danger/60 bg-danger/10"
          : "border-border bg-card";

  const statusDot =
    agent.status === "working"
      ? "bg-success"
      : agent.status === "paused"
        ? "bg-warning"
        : agent.status === "error"
          ? "bg-danger"
          : "bg-zinc-500";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`group relative flex w-40 sm:w-44 flex-col items-center rounded-xl border-2 p-3.5 shadow-sm transition-all hover:scale-[1.03] hover:shadow-md ${statusColor}`}
      >
        <span
          className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background ${statusDot} ${
            agent.status === "working" ? "animate-pulse-dot" : ""
          }`}
          title={agent.status}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-2xl">
          {agent.avatar}
        </div>
        <div className="mt-2 text-sm font-semibold text-center leading-tight">
          {agent.name}
        </div>
        <div className="text-[11px] text-muted">{agent.role}</div>
        <div className="mt-0.5 text-[10px] text-muted/80 truncate max-w-full px-1">
          {agent.model}
        </div>

        <div className="pointer-events-none absolute -bottom-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-[10px] text-muted opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100">
          ${agent.budgetSpent.toFixed(0)} / ${agent.budgetMonthly} spent
        </div>
      </div>

      {children && (
        <>
          <div className="h-5 w-px bg-border" />
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
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
      <div className="flex flex-1 items-center justify-center p-12 text-muted">
        Loading org chart…
      </div>
    );
  }

  const ceo = agents.find((a) => a.role === "CEO") || agents[0];
  const directReports = agents.filter(
    (a) => a.reportsTo === ceo?.id || (a.role !== "CEO" && !a.reportsTo)
  );
  const getReports = (id: string) => agents.filter((a) => a.reportsTo === id);

  return (
    <>
      <Header
        title="Org Chart"
        subtitle="Hierarchies, roles, reporting lines & governance"
      />
      <div className="flex-1 overflow-auto p-6 pt-16 lg:p-8 lg:pt-8">
        {agents.length === 0 ? (
          <p className="py-20 text-center text-muted">
            No agents yet. Hire some from the Agents page.
          </p>
        ) : (
          <div className="flex min-w-max flex-col items-center pb-8">
            {ceo && (
              <AgentNode agent={ceo}>
                {directReports.map((report) => {
                  const subReports = getReports(report.id);
                  return (
                    <div key={report.id} className="flex flex-col items-center">
                      <div className="h-5 w-px bg-border" />
                      <AgentNode agent={report}>
                        {subReports.length > 0 &&
                          subReports.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex flex-col items-center"
                            >
                              <div className="h-5 w-px bg-border" />
                              <AgentNode agent={sub} />
                            </div>
                          ))}
                      </AgentNode>
                    </div>
                  );
                })}
              </AgentNode>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-5 text-xs text-muted">
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
