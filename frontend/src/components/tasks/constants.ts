export const PREDEFINED_CATEGORIES = [
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "health", label: "Health" },
  { value: "learning", label: "Learning" },
  { value: "other", label: "Other" },
] as const;

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | null;

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export const RECURRENCE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

export const priorityNeonClass: Record<TaskPriority, string> = {
  low: "border-l-4 border-l-[var(--neon-lime)] shadow-[var(--shadow-glow-cyan)]/20 bg-[oklch(0.9_0.2_140/0.08)]",
  medium: "border-l-4 border-l-primary/80 shadow-[var(--shadow-glow-cyan)]/30",
  high: "border-l-4 border-l-[var(--neon-magenta)] shadow-[var(--shadow-glow-magenta)]/25 bg-[oklch(0.72_0.25_330/0.08)]",
  urgent: "border-l-4 border-l-destructive shadow-[0_0_20px_oklch(0.65_0.24_25/0.45)] bg-destructive/10",
};

export const priorityBadgeClass: Record<TaskPriority, string> = {
  low: "border-[var(--neon-lime)]/40 text-[var(--neon-lime)] bg-[var(--neon-lime)]/10",
  medium: "border-primary/40 text-primary bg-primary/10",
  high: "border-[var(--neon-magenta)]/40 text-[var(--neon-magenta)] bg-[var(--neon-magenta)]/10",
  urgent: "border-destructive/50 text-destructive bg-destructive/15 animate-pulse",
};

export function formatCategoryLabel(category: string): string {
  const found = PREDEFINED_CATEGORIES.find((c) => c.value === category);
  if (found) return found.label;
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");
}
