import type { TaskItem } from "@/services/placeholders";

export type TaskStatusKey = "completed" | "active" | "overdue" | "upcoming" | "pending" | "rescheduled";

export type StatusStyle = {
  label: string;
  badgeClass: string;
  cardBorderClass: string;
  cardBgClass: string;
  dotColor: string;
};

export const STATUS_STYLES: Record<TaskStatusKey, StatusStyle> = {
  completed: {
    label: "COMPLETED",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    cardBorderClass: "border-l-4 border-l-emerald-500/70",
    cardBgClass: "bg-emerald-500/5",
    dotColor: "#22c55e",
  },
  active: {
    label: "ACTIVE",
    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse",
    cardBorderClass: "border-l-4 border-l-blue-500/70",
    cardBgClass: "bg-blue-500/5",
    dotColor: "#3b82f6",
  },
  overdue: {
    label: "OVERDUE",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/40",
    cardBorderClass: "border-l-4 border-l-red-500/70",
    cardBgClass: "bg-red-500/5",
    dotColor: "#ef4444",
  },
  upcoming: {
    label: "UPCOMING",
    badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    cardBorderClass: "border-l-4 border-l-amber-500/70",
    cardBgClass: "bg-amber-500/5",
    dotColor: "#f59e0b",
  },
  rescheduled: {
    label: "RESCHEDULED",
    badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    cardBorderClass: "border-l-4 border-l-orange-500/70",
    cardBgClass: "bg-orange-500/5",
    dotColor: "#f97316",
  },
  pending: {
    label: "PENDING",
    badgeClass: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40",
    cardBorderClass: "border-l-4 border-l-zinc-500/40",
    cardBgClass: "bg-zinc-500/5",
    dotColor: "#71717a",
  },
};

export function getTaskStatus(task: TaskItem): TaskStatusKey {
  const now = new Date();
  const isDone = task.status === "done" || task.completed;
  const start = task.startTime ? new Date(task.startTime) : null;
  const end = task.endTime ? new Date(task.endTime) : (task.dueDate ? new Date(task.dueDate) : null);

  if (isDone) return "completed";
  if (task.status === "rescheduled") return "rescheduled";
  if (task.status === "in_progress" && (!end || end > now)) return "active";
  if (start && end && now >= start && now <= end) return "active";
  if (end && end < now) return "overdue";
  if (start && start > now) return "upcoming";
  if (task.due === "Overdue") return "overdue";
  return "pending";
}

export function getStatusStyle(task: TaskItem): StatusStyle {
  return STATUS_STYLES[getTaskStatus(task)];
}
