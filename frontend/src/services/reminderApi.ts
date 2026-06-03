import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/services/apiClient";

export type ReminderSoundType = "default" | "chime" | "bell" | "soft" | "urgent" | "silent";
export type ReminderStatus = "pending" | "triggered" | "snoozed" | "dismissed";
export type NotificationChannel = "push" | "email" | "in_app" | "browser";

export type ApiReminder = {
  id: string;
  taskId: string | { id: string; title?: string; fullscreenAlertEnabled?: boolean; soundEnabled?: boolean; vibrationEnabled?: boolean };
  reminderTime: string;
  soundType: ReminderSoundType;
  notificationType: NotificationChannel;
  status: ReminderStatus;
  snoozeUntil?: string | null;
  read: boolean;
  triggeredAt?: string | null;
  dismissedAt?: string | null;
  snoozedCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ReminderHistoryEntry = {
  id: string;
  reminderId: string;
  taskId: string | { id: string; title?: string; fullscreenAlertEnabled?: boolean; soundEnabled?: boolean; vibrationEnabled?: boolean };
  triggeredAt: string;
  dismissedAt?: string | null;
  snoozedCount: number;
  soundType?: string;
  notificationType?: string;
};

export type ReminderInput = {
  taskId: string;
  reminderTime: string;
  soundType?: ReminderSoundType;
  notificationType?: NotificationChannel;
  reminderEnabled?: boolean;
};

export type SnoozeMinutes = 5 | 15 | 60;

function taskTitle(taskId: ApiReminder["taskId"]): string {
  if (typeof taskId === "object" && taskId && "title" in taskId) {
    return (taskId as { title?: string }).title || "Task";
  }
  return "Task";
}

export function getReminderTaskTitle(reminder: ApiReminder): string {
  return taskTitle(reminder.taskId);
}

export function getReminderTaskId(reminder: ApiReminder): string {
  if (typeof reminder.taskId === "string") return reminder.taskId;
  return reminder.taskId?.id ?? "";
}

export async function fetchReminders(taskId?: string): Promise<ApiReminder[]> {
  const query = taskId ? `?taskId=${encodeURIComponent(taskId)}` : "";
  return apiGet<ApiReminder[]>(`/reminders${query}`);
}

export async function fetchDueReminders(): Promise<ApiReminder[]> {
  return apiGet<ApiReminder[]>("/reminders/due");
}

export async function fetchReminderHistory(limit = 50): Promise<ReminderHistoryEntry[]> {
  return apiGet<ReminderHistoryEntry[]>(`/reminders/history?limit=${limit}`);
}

export async function createReminder(body: ReminderInput): Promise<ApiReminder> {
  return apiPost<ApiReminder>("/reminders", body);
}

export async function updateReminder(
  id: string,
  body: Partial<ReminderInput & { read?: boolean; status?: ReminderStatus }>,
): Promise<ApiReminder> {
  return apiPut<ApiReminder>(`/reminders/${id}`, body);
}

export async function deleteReminder(id: string): Promise<{ id: string }> {
  return apiDelete<{ id: string }>(`/reminders/${id}`);
}

export async function snoozeReminder(id: string, minutes: SnoozeMinutes): Promise<ApiReminder> {
  return apiPatch<ApiReminder>(`/reminders/${id}/snooze`, { minutes });
}

export async function dismissReminder(id: string): Promise<ApiReminder> {
  return apiPatch<ApiReminder>(`/reminders/${id}/dismiss`);
}

export async function markReminderRead(id: string): Promise<ApiReminder> {
  return apiPatch<ApiReminder>(`/reminders/${id}/read`);
}

export async function markReminderTriggered(id: string): Promise<ApiReminder> {
  return apiPatch<ApiReminder>(`/reminders/${id}/trigger`);
}

export async function registerFcmToken(token: string): Promise<{
  registered: boolean;
  pushEnabled: boolean;
  tokenCount: number;
}> {
  return apiPost("/notifications/fcm-token", { token });
}

export function formatReminderTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function effectiveReminderTime(reminder: ApiReminder): Date {
  if (reminder.status === "snoozed" && reminder.snoozeUntil) {
    return new Date(reminder.snoozeUntil);
  }
  return new Date(reminder.reminderTime);
}

export function isReminderDue(reminder: ApiReminder, now = Date.now()): boolean {
  if (reminder.status === "dismissed") return false;
  return effectiveReminderTime(reminder).getTime() <= now;
}
