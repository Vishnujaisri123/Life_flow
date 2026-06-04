import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/services/api";
import { isApiConfigured } from "@/services/api";
import { placeholderTasks } from "@/services/placeholders";
import type { TaskItem } from "@/services/placeholders";
import {
  completeTask,
  createTask,
  deleteTask,
  fetchTasks,
  fetchTodayTasks,
  mapApiTaskToItem,
  reorderTasks,
  taskFormToPayload,
  updateTask,
  syncGoogleCalendarTasks,
  type ApiTask,
} from "@/services/taskApi";
import type { TaskFormValues, TaskFiltersState } from "@/components/tasks/types";
import { defaultTaskFilters } from "@/components/tasks/types";
import { isBefore, isAfter, parseISO } from "date-fns";
import { getISTDateKey, isTodayIST } from "@/utils/ist";

export const taskQueryKeys = {
  all: ["tasks"] as const,
  today: ["tasks", "today"] as const,
};

function invalidateTaskQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
  void queryClient.invalidateQueries({ queryKey: taskQueryKeys.today });
  void queryClient.invalidateQueries({ queryKey: ["analytics"] });
}

function getTaskDueDate(task: TaskItem): Date | null {
  const raw = task.dueDate ?? task.endTime ?? task.startTime;
  if (!raw) return null;
  const d = parseISO(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getISTDateRangeKey(dateString: string) {
  const date = parseISO(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return getISTDateKey(date);
}

export function applyClientFilters(tasks: TaskItem[], filters: TaskFiltersState): TaskItem[] {
  let result = [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false),
    );
  }
  if (filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status);
  }
  if (filters.priority !== "all") {
    result = result.filter((t) => t.priority === filters.priority);
  }
  if (filters.category !== "all") {
    result = result.filter((t) => (t.category ?? "work") === filters.category);
  }
  if (filters.dateFrom) {
    const fromKey = getISTDateRangeKey(filters.dateFrom);
    result = result.filter((t) => {
      const d = getTaskDueDate(t);
      return d ? getISTDateKey(d) >= fromKey : false;
    });
  }
  if (filters.dateTo) {
    const toKey = getISTDateRangeKey(filters.dateTo);
    result = result.filter((t) => {
      const d = getTaskDueDate(t);
      return d ? getISTDateKey(d) <= toKey : false;
    });
  }

  return result;
}

export function partitionTasks(tasks: TaskItem[]) {
  const todayKey = getISTDateKey(new Date());
  const today: TaskItem[] = [];
  const upcoming: TaskItem[] = [];
  const missed: TaskItem[] = [];
  const all = tasks;

  for (const task of tasks) {
    if (task.status === "done" || task.completed) continue;
    const due = getTaskDueDate(task);
    if (!due) continue;
    const dueKey = getISTDateKey(due);
    if (dueKey < todayKey) {
      missed.push(task);
    } else if (dueKey === todayKey) {
      today.push(task);
    } else {
      upcoming.push(task);
    }
  }

  return { today, upcoming, missed, all };
}

export function completionPercent(tasks: TaskItem[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "done" || t.completed).length;
  return Math.round((done / tasks.length) * 100);
}

export function useTasks() {
  const apiEnabled = isApiConfigured();

  const query = useQuery({
    queryKey: taskQueryKeys.all,
    queryFn: async () => {
      const tasks = await fetchTasks();
      return tasks.map(mapApiTaskToItem);
    },
    enabled: apiEnabled,
    staleTime: 30_000,
  });

  if (!apiEnabled) {
    return {
      tasks: placeholderTasks,
      isLoading: false,
      isError: false,
      isDemo: true,
      refetch: async () => {},
    };
  }

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isDemo: false,
    refetch: query.refetch,
  };
}

export function useTodayTasks() {
  const apiEnabled = isApiConfigured();

  return useQuery({
    queryKey: taskQueryKeys.today,
    queryFn: async () => {
      const tasks = await fetchTodayTasks();
      return tasks.map(mapApiTaskToItem);
    },
    enabled: apiEnabled,
    staleTime: 30_000,
  });
}

export function useTaskFilters(tasks: TaskItem[]) {
  const [filters, setFilters] = useState<TaskFiltersState>(defaultTaskFilters);
  const [activeSection, setActiveSection] = useState<
    "all" | "today" | "upcoming" | "missed"
  >("all");

  const filtered = useMemo(() => applyClientFilters(tasks, filters), [tasks, filters]);
  const sections = useMemo(() => partitionTasks(filtered), [filtered]);
  const progress = useMemo(() => completionPercent(filtered), [filtered]);

  const displayTasks = useMemo(() => {
    switch (activeSection) {
      case "today":
        return sections.today;
      case "upcoming":
        return sections.upcoming;
      case "missed":
        return sections.missed;
      default:
        return filtered;
    }
  }, [activeSection, filtered, sections]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const t of tasks) {
      if (t.category) set.add(t.category);
    }
    return Array.from(set).sort();
  }, [tasks]);

  const updateFilter = useCallback(
    <K extends keyof TaskFiltersState>(key: K, value: TaskFiltersState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => setFilters(defaultTaskFilters), []);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    activeSection,
    setActiveSection,
    filtered,
    displayTasks,
    sections,
    progress,
    categories,
  };
}

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const apiEnabled = isApiConfigured();

  const onError = (err: unknown) => {
    toast.error(err instanceof ApiError ? err.message : "Task action failed");
  };

  const createMutation = useMutation({
    mutationFn: (body: TaskFormValues) => {
      const payload = taskFormToPayload(body);
      return createTask({ ...payload, title: body.title } as Pick<ApiTask, "title"> & Partial<Omit<ApiTask, "id">>);
    },
    onSuccess: () => {
      invalidateTaskQueries(queryClient);
      toast.success("Task created");
    },
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: TaskFormValues }) =>
      updateTask(id, taskFormToPayload(body) as Partial<ApiTask>),
    onSuccess: () => {
      invalidateTaskQueries(queryClient);
      toast.success("Task updated");
    },
    onError,
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => reorderTasks(ids),
    onSuccess: () => {
      invalidateTaskQueries(queryClient);
    },
    onError,
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => updateTask(id, { status: "in_progress" }),
    onSuccess: () => {
      invalidateTaskQueries(queryClient);
      toast.success("Task started");
    },
    onError,
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: () => {
      invalidateTaskQueries(queryClient);
      void refreshUser();
      toast.success("Task completed");
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      invalidateTaskQueries(queryClient);
      toast.success("Task deleted");
    },
    onError,
  });

  const syncGoogleMutation = useMutation({
    mutationFn: () => syncGoogleCalendarTasks(),
    onSuccess: () => {
      invalidateTaskQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success("Google Calendar tasks synchronized");
    },
    onError: (err: any) => {
      console.warn("Google Calendar sync failed:", err);
    },
  });

  const reorderLocal = useCallback(
    (tasks: TaskItem[], fromIndex: number, toIndex: number) => {
      const next = [...tasks];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      if (apiEnabled) {
        reorderMutation.mutate(next.map((t) => t.id));
      }
      return next;
    },
    [apiEnabled, reorderMutation],
  );

  return {
    apiEnabled,
    createTask: createMutation.mutate,
    createTaskAsync: createMutation.mutateAsync,
    updateTask: updateMutation.mutate,
    reorderTasks: reorderMutation.mutate,
    reorderLocal,
    startTask: startMutation.mutate,
    completeTask: completeMutation.mutate,
    deleteTask: deleteMutation.mutate,
    syncGoogleCalendar: syncGoogleMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isReordering: reorderMutation.isPending,
    isStarting: startMutation.isPending,
    isCompleting: completeMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSyncingGoogle: syncGoogleMutation.isPending,
  };
}
