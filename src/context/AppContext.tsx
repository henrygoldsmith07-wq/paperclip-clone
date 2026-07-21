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
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  addGoal: (goal: Omit<Goal, "id" | "progress" | "status">) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
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
              message: `${agent?.name || "Agent"} moved '${task?.title}' to ${status.replace("_", " ")}`,
              timestamp: new Date().toISOString(),
            },
            ...s.activities,
          ],
        };
      });
    },
    []
  );

  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setState((s) => ({
        ...s,
        tasks: [...s.tasks, newTask],
        activities: [
          {
            id: `act-${Date.now()}`,
            type: "task_started",
            agentId: task.assigneeId,
            message: `New task created: '${newTask.title}'`,
            timestamp: now,
          },
          ...s.activities,
        ],
      }));
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
        addTask,
        addGoal,
        updateGoalProgress,
        addActivity,
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
