export type AgentStatus = "idle" | "working" | "paused" | "error";

export type AgentRole =
  | "CEO"
  | "CTO"
  | "CMO"
  | "CFO"
  | "Engineer"
  | "Designer"
  | "Sales"
  | "Support"
  | "Researcher"
  | "Writer";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  avatar: string; // emoji
  budgetMonthly: number;
  budgetSpent: number;
  lastHeartbeat: string;
  currentTask?: string;
  reportsTo?: string; // agent id
  skills: string[];
  model: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  status: "active" | "completed" | "blocked";
  ownerId: string;
  dueDate?: string;
  subgoals?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "in_progress" | "review" | "done";
  assigneeId?: string;
  priority: "low" | "medium" | "high" | "critical";
  goalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: "heartbeat" | "task_started" | "task_completed" | "budget_alert" | "goal_update" | "hire" | "message";
  agentId?: string;
  message: string;
  timestamp: string;
}

export interface Company {
  name: string;
  mission: string;
  founded: string;
}
