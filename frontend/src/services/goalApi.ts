import { apiClient } from "./apiClient";

export type Milestone = {
  _id?: string;
  title: string;
  isCompleted: boolean;
};

export type Goal = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: "work" | "personal" | "health" | "learning" | "finance" | "other";
  targetDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  progressPercentage: number;
  status: "active" | "paused" | "completed" | "archived";
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
};

export type GoalInput = Partial<Omit<Goal, "_id" | "userId" | "createdAt" | "updatedAt">>;

export async function fetchGoals(status?: string): Promise<Goal[]> {
  const params = status ? { status } : {};
  const { data } = await apiClient.get<{ message: string; data: Goal[] }>("/goals", { params });
  return data.data;
}

export async function createGoal(payload: GoalInput): Promise<Goal> {
  const { data } = await apiClient.post<{ message: string; data: Goal }>("/goals", payload);
  return data.data;
}

export async function updateGoal(id: string, payload: GoalInput): Promise<Goal> {
  const { data } = await apiClient.put<{ message: string; data: Goal }>(`/goals/${id}`, payload);
  return data.data;
}

export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/goals/${id}`);
}
