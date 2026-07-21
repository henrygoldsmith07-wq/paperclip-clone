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
  hireAgent: (agent: Omit<Agent, "id" | "lastHeartbeat" | "budgetSpent">) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  assignTask: (taskId: string, agentId: string) => void;
  updateTaskStatus: (taskId: string, status: Task["status"]) => void;
  addGoal: (goal: Omit<Goal, "id" | "progress" | "status">) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  addTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt"> & {
      status?: Task["status"];
    }
  ) => void;
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  simulateTick: () => void;
  resetData: () => void;
  isHydrated: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "paperclip-clone-state";

const defaultState: AppState = {
  company: defaultCompany,
  agents: initialAgents,
  goals: initialGoals,
  tasks: initialTasks,
  activities: initialActivities,
};

function loadState(): AppState {
  if (typeof window === "undefined") {
    return defaultState;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppState;
    }
  } catch {
    // ignore parse errors
  }
  return defaultState;
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Always start with default to avoid hydration mismatch
  const [state, setState] = useState<AppState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage only on client after mount
  useEffect(() => {
    setState(loadState());
    setIsHydrated(true);
  }, []);

  // Persist whenever state changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
        ],
      }));
    },
    []
  );

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

  const assignTask = useCallback((taskId: string, agentId: string) => {
    setState((s) => {
      const agent = s.agents.find((a) => a.id === agentId);
      const task = s.tasks.find((t) => t.id === taskId);
      return {
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                assigneeId: agentId,
                status: "todo",
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "task_started",
            agentId,
            message: `${agent?.name || "Agent"} assigned to '${task?.title || "task"}'`,
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ],
      };
    });
  }, []);

  const updateTaskStatus = useCallback(
    (taskId: string, status: Task["status"]) => {
      setState((s) => {
        const task = s.tasks.find((t) => t.id === taskId);
        const agent = s.agents.find((a) => a.id === task?.assigneeId);
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
              type: status === "done" ? "task_completed" : "task_started",
              agentId: task?.assigneeId,
              message: `${agent?.name || "Agent"} moved '${task?.title}' to ${status.replace(
                "_",
                " "
              )}`,
              timestamp: new Date().toISOString(),
            },
            ...s.activities,
          ],
        };
      });
    },
    []
  );

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
            type: "goal_update",
            message: `New goal created: ${newGoal.title}`,
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ],
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
              status: progress >= 100 ? "completed" : g.status,
            }
          : g
      ),
    }));
  }, []);

  const addTask = useCallback(
    (
      task: Omit<Task, "id" | "createdAt" | "updatedAt"> & {
        status?: Task["status"];
      }
    ) => {
      const newTask: Task = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        assigneeId: task.assigneeId,
        goalId: task.goalId,
        status: task.status || "backlog",
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        tasks: [...s.tasks, newTask],
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "task_started",
            message: `New task created: ${newTask.title}`,
            timestamp: new Date().toISOString(),
          },
          ...s.activities,
        ],
      }));
    },
    []
  );

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
        ],
      }));
    },
    []
  );

  const simulateTick = useCallback(() => {
    setState((s) => {
      let agents = [...s.agents];
      let tasks = [...s.tasks];
      let goals = [...s.goals];
      let activities = [...s.activities];

      // 1. Working agents spend a little budget + heartbeat
      agents = agents.map((a) => {
        if (a.status === "working") {
          const spend = Math.random() * 4.5 + 0.8;
          return {
            ...a,
            budgetSpent: Math.min(a.budgetMonthly, +(a.budgetSpent + spend).toFixed(2)),
            lastHeartbeat: new Date().toISOString(),
          };
        }
        return a;
      });

      // 2. Occasional status flip
      if (Math.random() > 0.45) {
        const idx = Math.floor(Math.random() * agents.length);
        const statuses: AgentStatus[] = ["idle", "working", "paused"];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        if (agents[idx].status !== newStatus) {
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
            message: `${agents[idx].name} is now ${newStatus}`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // 3. Advance a random non-done task
      const movable = tasks.filter(
        (t) => t.status === "todo" || t.status === "in_progress" || t.status === "review"
      );
      if (movable.length > 0 && Math.random() > 0.35) {
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
            message: `${agent?.name || "Agent"} moved '${t.title}' to ${next.replace("_", " ")}`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // 4. Nudge a random active goal
      if (Math.random() > 0.55) {
        const activeGoals = goals.filter((g) => g.status === "active" && g.progress < 100);
        if (activeGoals.length > 0) {
          const g = activeGoals[Math.floor(Math.random() * activeGoals.length)];
          const inc = Math.floor(Math.random() * 4) + 1;
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

      // 5. Budget alerts for agents > 80%
      agents.forEach((a) => {
        const pct = a.budgetMonthly > 0 ? a.budgetSpent / a.budgetMonthly : 0;
        if (pct > 0.8 && Math.random() > 0.65) {
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
        activities: activities.slice(0, 50),
      };
    });
  }, []);

  const resetData = useCallback(() => {
    setState(defaultState);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        hireAgent,
        updateAgentStatus,
        assignTask,
        updateTaskStatus,
        addGoal,
        updateGoalProgress,
        addTask,
        addActivity,
        simulateTick,
        resetData,
        isHydrated,
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
