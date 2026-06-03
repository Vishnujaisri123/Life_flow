import { apiGet } from "@/services/apiClient";

export type AnalyticsWeekPoint = {
  day: string;
  focus: number;
  tasks: number;
};

export type AnalyticsData = {
  productivityScore: number;
  streak: number;
  tasksDoneToday: number;
  tasksDoneTotal: number;
  tasksOpen: number;
  tasksTotal: number;
  weeklySeries: AnalyticsWeekPoint[];
};

export async function fetchAnalytics(): Promise<AnalyticsData> {
  return apiGet<AnalyticsData>("/analytics");
}
