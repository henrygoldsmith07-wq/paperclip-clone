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
  AgentRole,
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
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "paperclip-clone-state";

function loadState(): AppState {
  if (typeof window === "undefined") {
    return {
      company: defaultCompany,
      agents: initialAgents,
      goals: initialGoals,
      tasks: initialTasks,
      activities: initialActivities,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppState;
    }
  } catch {
    // ignore
  }
  return {
    company: defaultCompany,
    agents: initialAgents,
    goals: initialGoals,
    tasks: initialTasks,
    activities: initialActivities,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
    const fresh = {
      company: defaultCompany,
      agents: initialAgents,
      goals: initialGoals,
      tasks: initialTasks,
      activities: initialActivities,
    };
    setState(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
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
        addActivity,
        resetData,
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
