import type { RecurrenceFrequency, TaskPriority, TaskStatus } from "@/components/tasks/constants";

export type TaskFormValues = {
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
};

export type TaskFiltersState = {
  search: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  category: string;
  dateFrom: string;
  dateTo: string;
};

export const defaultTaskFilters: TaskFiltersState = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  dateFrom: "",
  dateTo: "",
};

export const emptyTaskForm: TaskFormValues = {
  title: "",
  description: "",
  category: "work",
  priority: "medium",
  status: "todo",
  startTime: "",
  dueDate: "",
  reminderEnabled: false,
  reminderBefore: 0,
  soundEnabled: true,
  vibrationEnabled: true,
  fullscreenAlertEnabled: false,
  recurrenceFrequency: "none",
  recurrenceInterval: 1,
  recurrenceEnd: "",
};
