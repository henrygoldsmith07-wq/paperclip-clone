"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  Agent,
  Goal,
  Task,
  Activity,
  Company,
  AgentStatus,
} from "@/lib/types";
import {
  company as sampleCompany,
  initialAgents,
  initialGoals,
  initialTasks,
  initialActivities,
} from "@/lib/data";

interface AppState {
  company: Company;
  agents: Agent[];
  goals: Goal[];
  tasks: Task[];
  activities: Activity[];
}

interface AppContextType extends AppState {
  isHydrated: boolean;
  hireAgent: (agent: Omit<Agent, "id" | "lastHeartbeat" | "budgetSpent">) => void;
  deleteAgent: (id: string) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  setAllAgentsStatus: (status: AgentStatus) => void;
  assignTask: (taskId: string, agentId: string) => void;
  updateTaskStatus: (taskId: string, status: Task["status"]) => void;
  createTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "status"> & {
      status?: Task["status"];
    }
  ) => void;
  deleteTask: (id: string) => void;
  addGoal: (goal: Omit<Goal, "id" | "progress" | "status">) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  deleteGoal: (id: string) => void;
  updateCompany: (updates: Partial<Company>) => void;
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  clearActivities: () => void;
  resetBudgets: () => void;
  processWork: () => void;
  clearCompany: () => void;
  loadSampleData: () => void;
  importState: (data: unknown) => boolean;
  exportState: () => AppState;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "paperclip-clone-state-v5";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyState(): AppState {
  return {
    company: {
      name: "My Company",
      mission: "Describe what your team of agents is building.",
      founded: new Date().toISOString().slice(0, 10),
    },
    agents: [],
    goals: [],
    tasks: [],
    activities: [],
  };
}

function sampleState(): AppState {
  return {
    company: { ...sampleCompany },
    agents: initialAgents.map((a) => ({ ...a, skills: [...a.skills] })),
    goals: initialGoals.map((g) => ({ ...g })),
    tasks: initialTasks.map((t) => ({ ...t })),
    activities: initialActivities.map((a) => ({ ...a })),
  };
}

function isValidState(data: unknown): data is AppState {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.agents) || !Array.isArray(d.goals)) return false;
  if (!Array.isArray(d.tasks) || !Array.isArray(d.activities)) return false;
  if (typeof d.company !== "object" || d.company === null) return false;
  const c = d.company as Record<string, unknown>;
  if (typeof c.name !== "string" || typeof c.mission !== "string") return false;
  return true;
}

function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (isValidState(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return emptyState();
}

function deriveGoals(goals: Goal[], tasks: Task[]): Goal[] {
  return goals.map((g) => {
    const linked = tasks.filter((t) => t.goalId === g.id);
    if (linked.length === 0) return g;
    const done = linked.filter((t) => t.status === "done").length;
    const progress = Math.round((done / linked.length) * 100);
    return {
      ...g,
      progress,
      status:
        progress >= 100
          ? "completed"
          : g.status === "completed"
            ? "active"
            : g.status,
    };
  });
}

function deriveAgents(agents: Agent[], tasks: Task[]): Agent[] {
  return agents.map((a) => {
    if (a.status === "paused" || a.status === "error") {
      return { ...a, currentTask: undefined };
    }
    const active = tasks.find(
      (t) =>
        t.assigneeId === a.id &&
        (t.status === "in_progress" || t.status === "review")
    );
    if (active) {
      return {
        ...a,
        status: "working" as const,
        currentTask: active.title,
        lastHeartbeat: new Date().toISOString(),
      };
    }
    if (a.status === "working") {
      return { ...a, status: "idle" as const, currentTask: undefined };
    }
    return { ...a, currentTask: undefined };
  });
}

function chargeBudget(agent: Agent, amount: number): Agent {
  return {
    ...agent,
    budgetSpent: Math.min(
      agent.budgetMonthly,
      +(agent.budgetSpent + amount).toFixed(2)
    ),
    lastHeartbeat: new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* quota */
      }
    }
  }, [state, isHydrated]);

  const hireAgent = useCallback(
    (agent: Omit<Agent, "id" | "lastHeartbeat" | "budgetSpent">) => {
      const newAgent: Agent = {
        ...agent,
        id: uid("agt"),
        budgetSpent: 0,
        lastHeartbeat: new Date().toISOString(),
      };
      setState((s) => {
        const ceo = s.agents.find((a) => a.role === "CEO");
        const withReports =
          newAgent.role === "CEO"
            ? { ...newAgent, reportsTo: undefined }
            : {
                ...newAgent,
                reportsTo: newAgent.reportsTo || ceo?.id,
              };
        return {
          ...s,
          agents: [...s.agents, withReports],
          activities: [
            {
              id: uid("act"),
              type: "hire" as const,
              message: `Hired ${withReports.name} as ${withReports.role}`,
              timestamp: new Date().toISOString(),
            },
            ...s.activities,
          ].slice(0, 100),
        };
      });
    },
    []
  );

  const deleteAgent = useCallback((id: string) => {
    setState((s) => {
      const agent = s.agents.find((a) => a.id === id);
      if (!agent) return s;
      const ceo = s.agents.find((a) => a.role === "CEO" && a.id !== id);
      const tasks = s.tasks.map((t) =>
        t.assigneeId === id ? { ...t, assigneeId: undefined } : t
      );
      const agents = s.agents
        .filter((a) => a.id !== id)
        .map((a) => (a.reportsTo === id ? { ...a, reportsTo: ceo?.id } : a));
      return {
        ...s,
        agents: deriveAgents(agents, tasks),
        tasks,
        goals: s.goals.map((g) =>
          g.ownerId === id ? { ...g, ownerId: ceo?.id || "" } : g
        ),
        activities: [
          {
            id: uid("act"),
            type: "message" as const,
            message: `Removed ${agent.name} from the team`,
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ].slice(0, 100),
      };
    });
  }, []);

  const updateAgentStatus = useCallback((id: string, status: AgentStatus) => {
    setState((s) => {
      let agents = s.agents.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              lastHeartbeat: new Date().toISOString(),
              currentTask:
                status === "idle" || status === "paused"
                  ? undefined
                  : a.currentTask,
            }
          : a
      );
      if (status !== "paused" && status !== "error") {
        agents = deriveAgents(agents, s.tasks);
      }
      return { ...s, agents };
    });
  }, []);

  const setAllAgentsStatus = useCallback((status: AgentStatus) => {
    setState((s) => {
      let agents = s.agents.map((a) => ({
        ...a,
        status,
        lastHeartbeat: new Date().toISOString(),
        currentTask:
          status === "idle" || status === "paused" ? undefined : a.currentTask,
      }));
      if (status !== "paused" && status !== "error") {
        agents = deriveAgents(agents, s.tasks);
      }
      return {
        ...s,
        agents,
        activities: [
          {
            id: uid("act"),
            type: "message" as const,
            message: `All agents set to ${status}`,
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ].slice(0, 100),
      };
    });
  }, []);

  const assignTask = useCallback((taskId: string, agentId: string) => {
    setState((s) => {
      const agent = s.agents.find((a) => a.id === agentId);
      const task = s.tasks.find((t) => t.id === taskId);
      if (!task || !agent) return s;

      const tasks = s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assigneeId: agentId,
              status: t.status === "backlog" ? "todo" : t.status,
              updatedAt: new Date().toISOString(),
            }
          : t
      );

      return {
        ...s,
        tasks,
        agents: deriveAgents(s.agents, tasks),
        goals: deriveGoals(s.goals, tasks),
        activities: [
          {
            id: uid("act"),
            type: "task_started" as const,
            agentId,
            message: `${agent.name} assigned to “${task.title}”`,
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ].slice(0, 100),
      };
    });
  }, []);

  const updateTaskStatus = useCallback(
    (taskId: string, status: Task["status"]) => {
      setState((s) => {
        const task = s.tasks.find((t) => t.id === taskId);
        if (!task) return s;
        const agent = s.agents.find((a) => a.id === task.assigneeId);
        const label = status.replace(/_/g, " ");
        const activityType: Activity["type"] =
          status === "done" ? "task_completed" : "task_started";

        const tasks = s.tasks.map((t) =>
          t.id === taskId
            ? { ...t, status, updatedAt: new Date().toISOString() }
            : t
        );

        let agents = s.agents;
        if (agent && (status === "in_progress" || status === "done")) {
          const cost = status === "done" ? 1.25 : 0.75;
          agents = s.agents.map((a) =>
            a.id === agent.id ? chargeBudget(a, cost) : a
          );
        }
        agents = deriveAgents(agents, tasks);
        const goals = deriveGoals(s.goals, tasks);

        const extras: Activity[] = [];
        if (status === "done" && task.goalId) {
          const g = goals.find((x) => x.id === task.goalId);
          if (g) {
            extras.push({
              id: uid("act"),
              type: "goal_update",
              message: `Goal “${g.title}” now ${g.progress}% (from task completion)`,
              timestamp: new Date().toISOString(),
            });
          }
        }

        return {
          ...s,
          tasks,
          agents,
          goals,
          activities: [
            {
              id: uid("act"),
              type: activityType,
              agentId: task.assigneeId,
              message: `${agent?.name || "You"} moved “${task.title}” → ${label}`,
              timestamp: new Date().toISOString(),
            },
            ...extras,
            ...s.activities,
          ].slice(0, 100),
        };
      });
    },
    []
  );

  const createTask = useCallback(
    (
      task: Omit<Task, "id" | "createdAt" | "updatedAt" | "status"> & {
        status?: Task["status"];
      }
    ) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...task,
        id: uid("task"),
        status: task.status || "backlog",
        createdAt: now,
        updatedAt: now,
      };
      setState((s) => {
        const tasks = [newTask, ...s.tasks];
        return {
          ...s,
          tasks,
          agents: deriveAgents(s.agents, tasks),
          goals: deriveGoals(s.goals, tasks),
          activities: [
            {
              id: uid("act"),
              type: "task_started" as const,
              message: `Created task “${newTask.title}”`,
              timestamp: now,
            },
            ...s.activities,
          ].slice(0, 100),
        };
      });
    },
    []
  );

  const deleteTask = useCallback((id: string) => {
    setState((s) => {
      const task = s.tasks.find((t) => t.id === id);
      const tasks = s.tasks.filter((t) => t.id !== id);
      return {
        ...s,
        tasks,
        agents: deriveAgents(s.agents, tasks),
        goals: deriveGoals(s.goals, tasks),
        activities: task
          ? [
              {
                id: uid("act"),
                type: "message" as const,
                message: `Deleted task “${task.title}”`,
                timestamp: new Date().toISOString(),
              },
              ...s.activities,
            ].slice(0, 100)
          : s.activities,
      };
    });
  }, []);

  const addGoal = useCallback(
    (goal: Omit<Goal, "id" | "progress" | "status">) => {
      const newGoal: Goal = {
        ...goal,
        id: uid("goal"),
        progress: 0,
        status: "active",
      };
      setState((s) => ({
        ...s,
        goals: [...s.goals, newGoal],
        activities: [
          {
            id: uid("act"),
            type: "goal_update" as const,
            message: `Created goal “${newGoal.title}”`,
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ].slice(0, 100),
      }));
    },
    []
  );

  const updateGoalProgress = useCallback((id: string, progress: number) => {
    setState((s) => {
      const linked = s.tasks.filter((t) => t.goalId === id);
      if (linked.length > 0) {
        return { ...s, goals: deriveGoals(s.goals, s.tasks) };
      }
      return {
        ...s,
        goals: s.goals.map((g) =>
          g.id === id
            ? {
                ...g,
                progress: Math.min(100, Math.max(0, progress)),
                status:
                  progress >= 100
                    ? "completed"
                    : g.status === "completed" && progress < 100
                      ? "active"
                      : g.status,
              }
            : g
        ),
      };
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((s) => {
      const tasks = s.tasks.map((t) =>
        t.goalId === id ? { ...t, goalId: undefined } : t
      );
      return {
        ...s,
        goals: s.goals.filter((g) => g.id !== id),
        tasks,
        agents: deriveAgents(s.agents, tasks),
      };
    });
  }, []);

  const updateCompany = useCallback((updates: Partial<Company>) => {
    setState((s) => ({
      ...s,
      company: { ...s.company, ...updates },
    }));
  }, []);

  const addActivity = useCallback(
    (activity: Omit<Activity, "id" | "timestamp">) => {
      setState((s) => ({
        ...s,
        activities: [
          {
            ...activity,
            id: uid("act"),
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ].slice(0, 100),
      }));
    },
    []
  );

  const clearActivities = useCallback(() => {
    setState((s) => ({ ...s, activities: [] }));
  }, []);

  const resetBudgets = useCallback(() => {
    setState((s) => ({
      ...s,
      agents: s.agents.map((a) => ({ ...a, budgetSpent: 0 })),
      activities: [
        {
          id: uid("act"),
          type: "message" as const,
          message: "All budgets reset to $0 spent",
          timestamp: new Date().toISOString(),
        },
        ...s.activities,
      ].slice(0, 100),
    }));
  }, []);

  const processWork = useCallback(() => {
    setState((s) => {
      let tasks = s.tasks.map((t) => ({ ...t }));
      let agents = s.agents.map((a) => ({ ...a }));
      const activities = [...s.activities];
      let moved = false;

      const order: Task["status"][] = ["in_progress", "review", "todo"];
      for (const st of order) {
        const candidates = tasks.filter(
          (t) => t.status === st && t.assigneeId
        );
        if (candidates.length === 0) continue;
        const t = candidates[0];
        const nextMap: Partial<Record<Task["status"], Task["status"]>> = {
          todo: "in_progress",
          in_progress: "review",
          review: "done",
        };
        const next = nextMap[t.status];
        if (!next) continue;

        tasks = tasks.map((tt) =>
          tt.id === t.id
            ? { ...tt, status: next, updatedAt: new Date().toISOString() }
            : tt
        );
        const agent = agents.find((a) => a.id === t.assigneeId);
        if (agent && (next === "in_progress" || next === "done")) {
          agents = agents.map((a) =>
            a.id === agent.id
              ? chargeBudget(a, next === "done" ? 1.25 : 0.75)
              : a
          );
        }
        activities.unshift({
          id: uid("act"),
          type: next === "done" ? "task_completed" : "task_started",
          agentId: t.assigneeId,
          message: `${agent?.name || "Agent"} advanced “${t.title}” → ${next.replace(/_/g, " ")}`,
          timestamp: new Date().toISOString(),
        });
        moved = true;
        break;
      }

      if (!moved) {
        activities.unshift({
          id: uid("act"),
          type: "message",
          message:
            "No assigned work to advance. Assign a task, then move it to To Do.",
          timestamp: new Date().toISOString(),
        });
      }

      agents = deriveAgents(agents, tasks);
      const goals = deriveGoals(s.goals, tasks);

      return {
        ...s,
        tasks,
        agents,
        goals,
        activities: activities.slice(0, 100),
      };
    });
  }, []);

  const clearCompany = useCallback(() => {
    const next = emptyState();
    setState(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const loadSampleData = useCallback(() => {
    const next = sampleState();
    setState(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const importState = useCallback((data: unknown) => {
    if (!isValidState(data)) return false;
    setState({
      ...data,
      agents: deriveAgents(data.agents, data.tasks),
      goals: deriveGoals(data.goals, data.tasks),
    });
    return true;
  }, []);

  const exportState = useCallback(() => state, [state]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        isHydrated,
        hireAgent,
        deleteAgent,
        updateAgentStatus,
        setAllAgentsStatus,
        assignTask,
        updateTaskStatus,
        createTask,
        deleteTask,
        addGoal,
        updateGoalProgress,
        deleteGoal,
        updateCompany,
        addActivity,
        clearActivities,
        resetBudgets,
        processWork,
        clearCompany,
        loadSampleData,
        importState,
        exportState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
