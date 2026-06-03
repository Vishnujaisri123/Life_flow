import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/services/analyticsApi";
import { isApiConfigured } from "@/services/api";
import { analyticsSeries, dashboardStats } from "@/services/placeholders";

export function useAnalytics() {
  const apiEnabled = isApiConfigured();

  const query = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    enabled: apiEnabled,
    staleTime: 60_000,
  });

  if (!apiEnabled) {
    return {
      data: null,
      stats: dashboardStats,
      weeklySeries: [...analyticsSeries],
      isLoading: false,
      isDemo: true,
    };
  }

  const data = query.data;

  const stats = data
    ? [
        {
          label: "Focus score",
          value: `${data.productivityScore}%`,
          trend: "productivity",
        },
        {
          label: "Tasks done",
          value: String(data.tasksDoneToday),
          trend: "today",
        },
        { label: "Streak", value: String(data.streak), trend: "days" },
        {
          label: "Open tasks",
          value: String(data.tasksOpen),
          trend: `${data.tasksTotal} total`,
        },
      ]
    : [];

  return {
    data: data ?? null,
    stats,
    weeklySeries: data?.weeklySeries ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isDemo: false,
    refetch: query.refetch,
  };
}
