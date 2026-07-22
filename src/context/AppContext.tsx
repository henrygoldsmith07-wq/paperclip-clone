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
  company as defaultCompany,
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
  simulateTick: () => void;
  resetData: () => void;
  importState: (data: AppState) => void;
  exportState: () => AppState;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "paperclip-clone-state-v4";

const defaultState: AppState = {
  company: defaultCompany,
  agents: initialAgents,
  goals: initialGoals,
  tasks: initialTasks,
  activities: initialActivities,
};

function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    /* ignore corrupt data */
  }
  return defaultState;
}

function isValidState(data: unknown): data is AppState {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.agents) &&
    Array.isArray(d.goals) &&
    Array.isArray(d.tasks) &&
    Array.isArray(d.activities) &&
    typeof d.company === "object" &&
    d.company !== null
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
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
        id: `agt-${Date.now()}`,
        budgetSpent: 0,
        lastHeartbeat: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        agents: [...s.agents, newAgent],
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "hire",
            message: `New agent ${newAgent.name} (${newAgent.role}) hired and onboarded`,
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ].slice(0, 100),
      }));
    },
    []
  );

  const deleteAgent = useCallback((id: string) => {
    setState((s) => {
      const agent = s.agents.find((a) => a.id === id);
      if (!agent) return s;
      return {
        ...s,
        agents: s.agents.filter((a) => a.id !== id),
        tasks: s.tasks.map((t) =>
          t.assigneeId === id ? { ...t, assigneeId: undefined } : t
        ),
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "message" as const,
            message: `Agent ${agent.name} was removed from the team`,
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ].slice(0, 100),
      };
    });
  }, []);

  const updateAgentStatus = useCallback((id: string, status: AgentStatus) => {
    setState((s) => ({
      ...s,
      agents: s.agents.map((a) =>
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
      ),
    }));
  }, []);

  const setAllAgentsStatus = useCallback((status: AgentStatus) => {
    setState((s) => ({
      ...s,
      agents: s.agents.map((a) => ({
        ...a,
        status,
        lastHeartbeat: new Date().toISOString(),
        currentTask:
          status === "idle" || status === "paused" ? undefined : a.currentTask,
      })),
      activities: [
        {
          id: `act-${Date.now()}`,
          type: "message" as const,
          message: `All agents set to ${status}`,
          timestamp: new Date().toISOString(),
        },
        ...s.activities,
      ].slice(0, 100),
    }));
  }, []);

  const assignTask = useCallback((taskId: string, agentId: string) => {
    setState((s) => {
      const agent = s.agents.find((a) => a.id === agentId);
      const task = s.tasks.find((t) => t.id === taskId);
      if (!task) return s;
      return {
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                assigneeId: agentId,
                status: t.status === "backlog" ? "todo" : t.status,
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "task_started" as const,
            agentId,
            message: `${agent?.name || "Agent"} assigned to '${task.title}'`,
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
        return {
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status, updatedAt: new Date().toISOString() }
              : t
          ),
          activities: [
            {
              id: `act-${Date.now()}`,
              type: (status === "done" ? "task_completed" : "task_started") as const,
              agentId: task.assigneeId,
              message: `${agent?.name || "System"} moved '${task.title}' to ${status.replace("_", " ")}`,
              timestamp: new Date().toISOString(),
            },
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
        id: `task-${Date.now()}`,
        status: task.status || "backlog",
        createdAt: now,
        updatedAt: now,
      };
      setState((s) => ({
        ...s,
        tasks: [newTask, ...s.tasks],
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "task_started" as const,
            message: `New task created: ${newTask.title}`,
            timestamp: now,
          },
          ...s.activities,
        ].slice(0, 100),
      }));
    },
    []
  );

  const deleteTask = useCallback((id: string) => {
    setState((s) => {
      const task = s.tasks.find((t) => t.id === id);
      return {
        ...s,
        tasks: s.tasks.filter((t) => t.id !== id),
        activities: task
          ? [
              {
                id: `act-${Date.now()}`,
                type: "message" as const,
                message: `Task deleted: ${task.title}`,
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
        id: `goal-${Date.now()}`,
        progress: 0,
        status: "active",
      };
      setState((s) => ({
        ...s,
        goals: [...s.goals, newGoal],
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "goal_update" as const,
            message: `New goal created: ${newGoal.title}`,
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ].slice(0, 100),
      }));
    },
    []
  );

  const updateGoalProgress = useCallback((id: string, progress: number) => {
    setState((s) => ({
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
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      goals: s.goals.filter((g) => g.id !== id),
      tasks: s.tasks.map((t) =>
        t.goalId === id ? { ...t, goalId: undefined } : t
      ),
    }));
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
            id: `act-${Date.now()}`,
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
          id: `act-${Date.now()}`,
          type: "message" as const,
          message: "All agent budgets reset to $0 spent",
          timestamp: new Date().toISOString(),
        },
        ...s.activities,
      ].slice(0, 100),
    }));
  }, []);

  const simulateTick = useCallback(() => {
    setState((s) => {
      let agents = s.agents.map((a) => ({ ...a }));
      let tasks = s.tasks.map((t) => ({ ...t }));
      let goals = s.goals.map((g) => ({ ...g }));
      const activities = [...s.activities];

      agents = agents.map((a) => {
        if (a.status === "working") {
          const spend = +(Math.random() * 3.2 + 0.4).toFixed(2);
          return {
            ...a,
            budgetSpent: Math.min(
              a.budgetMonthly,
              +(a.budgetSpent + spend).toFixed(2)
            ),
            lastHeartbeat: new Date().toISOString(),
          };
        }
        return a;
      });

      if (agents.length > 0 && Math.random() > 0.48) {
        const idx = Math.floor(Math.random() * agents.length);
        const options: AgentStatus[] = ["idle", "working", "paused"];
        const newStatus = options[Math.floor(Math.random() * options.length)];
        if (agents[idx].status !== newStatus) {
          const prev = agents[idx].status;
          agents[idx] = {
            ...agents[idx],
            status: newStatus,
            lastHeartbeat: new Date().toISOString(),
            currentTask:
              newStatus === "idle" || newStatus === "paused"
                ? undefined
                : agents[idx].currentTask,
          };
          activities.unshift({
            id: `act-${Date.now()}-st`,
            type: "heartbeat",
            agentId: agents[idx].id,
            message: `${agents[idx].name} changed from ${prev} → ${newStatus}`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      const movable = tasks.filter(
        (t) =>
          t.status === "todo" ||
          t.status === "in_progress" ||
          t.status === "review"
      );
      if (movable.length > 0 && Math.random() > 0.38) {
        const t = movable[Math.floor(Math.random() * movable.length)];
        const nextMap: Partial<Record<Task["status"], Task["status"]>> = {
          todo: "in_progress",
          in_progress: "review",
          review: "done",
        };
        const next = nextMap[t.status];
        if (next) {
          tasks = tasks.map((tt) =>
            tt.id === t.id
              ? { ...tt, status: next, updatedAt: new Date().toISOString() }
              : tt
          );
          const agent = agents.find((a) => a.id === t.assigneeId);
          activities.unshift({
            id: `act-${Date.now()}-tk`,
            type: next === "done" ? "task_completed" : "task_started",
            agentId: t.assigneeId,
            message: `${agent?.name || "System"} moved '${t.title}' to ${next.replace("_", " ")}`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      if (Math.random() > 0.52) {
        const active = goals.filter(
          (g) => g.status === "active" && g.progress < 100
        );
        if (active.length > 0) {
          const g = active[Math.floor(Math.random() * active.length)];
          const inc = Math.floor(Math.random() * 5) + 1;
          const newProg = Math.min(100, g.progress + inc);
          goals = goals.map((gg) =>
            gg.id === g.id
              ? {
                  ...gg,
                  progress: newProg,
                  status: newProg >= 100 ? "completed" : "active",
                }
              : gg
          );
          activities.unshift({
            id: `act-${Date.now()}-gl`,
            type: "goal_update",
            message: `Progress on '${g.title}' → ${newProg}%`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      agents.forEach((a) => {
        const pct = a.budgetMonthly > 0 ? a.budgetSpent / a.budgetMonthly : 0;
        if (pct >= 0.85 && Math.random() > 0.72) {
          activities.unshift({
            id: `act-${Date.now()}-bd-${a.id}`,
            type: "budget_alert",
            agentId: a.id,
            message: `${a.name} has used ${Math.round(pct * 100)}% of monthly budget ($${a.budgetSpent.toFixed(0)} / $${a.budgetMonthly})`,
            timestamp: new Date().toISOString(),
          });
        }
      });

      return {
        ...s,
        agents,
        tasks,
        goals,
        activities: activities.slice(0, 100),
      };
    });
  }, []);

  const resetData = useCallback(() => {
    setState(defaultState);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const importState = useCallback((data: AppState) => {
    if (!isValidState(data)) return;
    setState(data);
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
        simulateTick,
        resetData,
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
