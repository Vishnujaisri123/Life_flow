import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";
import type { AiScheduleBlock } from "@/types/ai";

export type SavedPlan = {
  _id: string;
  title: string;
  planData: {
    blocks: AiScheduleBlock[];
  };
  createdAt: string;
  updatedAt: string;
};

export async function fetchPlans(): Promise<SavedPlan[]> {
  return apiGet<SavedPlan[]>("/plans");
}

export async function createPlan(title: string, blocks: AiScheduleBlock[]): Promise<SavedPlan> {
  return apiPost<SavedPlan>("/plans", { title, planData: { blocks } });
}

export async function updatePlan(id: string, title: string, blocks: AiScheduleBlock[]): Promise<SavedPlan> {
  return apiPut<SavedPlan>(`/plans/${id}`, { title, planData: { blocks } });
}

export async function deletePlan(id: string): Promise<void> {
  return apiDelete<void>(`/plans/${id}`);
}
