import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/services/apiClient";
import type { RecurrenceFrequency, TaskPriority, TaskStatus } from "@/components/tasks/constants";
import type { TaskItem } from "@/services/placeholders";

export type ApiTask = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority: TaskPriority;
  status: TaskStatus;
  order?: number;
  startTime?: string | null;
  endTime?: string | null;
  dueDate?: string | null;
  reminderEnabled?: boolean;
  reminderBefore?: number;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  fullscreenAlertEnabled?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceInterval?: number;
  recurrenceEnd?: string | null;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TaskQueryParams = {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  completed?: boolean;
  dateFrom?: string;
  dateTo?: string;
};

function formatDue(task: ApiTask): string | undefined {
  const date = task.dueDate ?? task.endTime ?? task.startTime;
  if (!date) return undefined;
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (task.status === "done" || task.completed) return "Done";
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function mapApiTaskToItem(task: ApiTask): TaskItem {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    status: task.status,
    priority: task.priority,
    order: task.order,
    due: formatDue(task),
    dueDate: task.dueDate ?? task.endTime ?? null,
    startTime: task.startTime,
    endTime: task.endTime,
    reminderEnabled: task.reminderEnabled,
    reminderBefore: task.reminderBefore,
    soundEnabled: task.soundEnabled,
    vibrationEnabled: task.vibrationEnabled,
    fullscreenAlertEnabled: task.fullscreenAlertEnabled,
    recurrenceFrequency: task.recurrenceFrequency ?? null,
    recurrenceInterval: task.recurrenceInterval,
    recurrenceEnd: task.recurrenceEnd,
    completed: task.completed,
    createdAt: task.createdAt,
  };
}

export function taskFormToPayload(
  form: {
    title: string;
    description: string;
    category: string;
    priority: TaskPriority;
    status: TaskStatus;
    startTime: string;
    dueDate: string;
    reminderEnabled: boolean;
    reminderBefore: number;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    fullscreenAlertEnabled: boolean;
    recurrenceFrequency: RecurrenceFrequency | "none";
    recurrenceInterval: number;
    recurrenceEnd: string;
  },
): Partial<ApiTask> {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category.trim() || "work",
    priority: form.priority,
    status: form.status,
    startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
    dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    endTime: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    reminderEnabled: form.reminderEnabled,
    reminderBefore: form.reminderBefore,
    soundEnabled: form.soundEnabled,
    vibrationEnabled: form.vibrationEnabled,
    fullscreenAlertEnabled: form.fullscreenAlertEnabled,
    recurrenceFrequency:
      form.recurrenceFrequency === "none" ? null : form.recurrenceFrequency,
    recurrenceInterval: form.recurrenceInterval,
    recurrenceEnd: form.recurrenceEnd ? new Date(form.recurrenceEnd).toISOString() : null,
  };
}

export function taskItemToForm(task: TaskItem): typeof import("@/components/tasks/types").emptyTaskForm {
  const toInput = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
  };
  return {
    title: task.title,
    description: task.description ?? "",
    category: task.category ?? "work",
    priority: task.priority,
    status: task.status,
    startTime: toInput(task.startTime),
    dueDate: toInput(task.dueDate ?? task.endTime),
    reminderEnabled: task.reminderEnabled ?? false,
    reminderBefore: task.reminderBefore ?? 0,
    soundEnabled: task.soundEnabled ?? true,
    vibrationEnabled: task.vibrationEnabled ?? true,
    fullscreenAlertEnabled: task.fullscreenAlertEnabled ?? false,
    recurrenceFrequency: task.recurrenceFrequency ?? "none",
    recurrenceInterval: task.recurrenceInterval ?? 1,
    recurrenceEnd: toInput(task.recurrenceEnd),
  };
}

function buildTasksPath(params?: TaskQueryParams): string {
  if (!params) return "/tasks";
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.priority) qs.set("priority", params.priority);
  if (params.category) qs.set("category", params.category);
  if (params.completed !== undefined) qs.set("completed", String(params.completed));
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);
  const q = qs.toString();
  return q ? `/tasks?${q}` : "/tasks";
}

export async function fetchTasks(params?: TaskQueryParams): Promise<ApiTask[]> {
  return apiGet<ApiTask[]>(buildTasksPath(params));
}

export async function fetchTodayTasks(): Promise<ApiTask[]> {
  return apiGet<ApiTask[]>("/tasks/today");
}

export async function createTask(
  body: Pick<ApiTask, "title"> & Partial<Omit<ApiTask, "id">>,
): Promise<ApiTask> {
  return apiPost<ApiTask>("/tasks", body);
}

export async function updateTask(id: string, body: Partial<ApiTask>): Promise<ApiTask> {
  return apiPut<ApiTask>(`/tasks/${id}`, body);
}

export async function reorderTasks(ids: string[]): Promise<ApiTask[]> {
  return apiPatch<ApiTask[]>("/tasks/reorder", { ids });
}

export async function completeTask(id: string): Promise<ApiTask> {
  return apiPatch<ApiTask>(`/tasks/${id}/complete`);
}

export async function deleteTask(id: string): Promise<{ id: string }> {
  return apiDelete<{ id: string }>(`/tasks/${id}`);
}

export async function syncGoogleCalendarTasks(): Promise<ApiTask[]> {
  return apiPost<ApiTask[]>("/tasks/sync-google");
}

