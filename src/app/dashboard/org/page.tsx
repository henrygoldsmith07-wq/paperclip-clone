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
      ? "border-success/50 bg-success/10"
      : agent.status === "paused"
        ? "border-warning/50 bg-warning/10"
        : agent.status === "error"
          ? "border-danger/50 bg-danger/10"
          : "border-border bg-card";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex w-44 flex-col items-center rounded-xl border-2 p-4 ${statusColor}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-2xl">
          {agent.avatar}
        </div>
        <div className="mt-2 text-sm font-semibold">{agent.name}</div>
        <div className="text-[11px] text-muted">{agent.role}</div>
        <div className="mt-1 text-[10px] text-muted">{agent.model}</div>
      </div>
      {children && (
        <>
          <div className="h-6 w-px bg-border" />
          <div className="flex gap-6">{children}</div>
        </>
      )}
    </div>
  );
}

export default function OrgPage() {
  const { agents } = useApp();

  const ceo = agents.find((a) => a.role === "CEO") || agents[0];
  const directReports = agents.filter(
    (a) => a.reportsTo === ceo?.id || (a.role !== "CEO" && !a.reportsTo)
  );
  const getReports = (id: string) =>
    agents.filter((a) => a.reportsTo === id);

  return (
    <>
      <Header
        title="Org Chart"
        subtitle="Hierarchies, roles, reporting lines & governance"
      />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex min-w-max flex-col items-center">
          {ceo && (
            <AgentNode agent={ceo}>
              {directReports.map((report) => {
                const subReports = getReports(report.id);
                return (
                  <div key={report.id} className="flex flex-col items-center">
                    <div className="h-6 w-px bg-border" />
                    <AgentNode agent={report}>
                      {subReports.length > 0 && (
                        <div className="flex gap-4">
                          {subReports.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex flex-col items-center"
                            >
                              <div className="h-6 w-px bg-border" />
                              <AgentNode agent={sub} />
                            </div>
                          ))}
                        </div>
                      )}
                    </AgentNode>
                  </div>
                );
              })}
            </AgentNode>
          )}
        </div>

        {/* Legend */}
        <div className="mt-12 flex justify-center gap-6 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border-2 border-success/50 bg-success/10" />
            Working
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border-2 border-border bg-card" />
            Idle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border-2 border-warning/50 bg-warning/10" />
            Paused
          </span>
        </div>
      </div>
    </>
  );
}
