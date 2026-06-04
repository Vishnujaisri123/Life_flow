import type { RecurrenceFrequency, TaskPriority, TaskStatus } from "@/components/tasks/constants";

export type TaskItem = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: TaskStatus;
  priority: TaskPriority;
  order?: number;
  due?: string;
  dueDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  reminderEnabled?: boolean;
  reminderBefore?: number;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  fullscreenAlertEnabled?: boolean;
  duration?: number | null;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceInterval?: number;
  recurrenceEnd?: string | null;
  completed?: boolean;
  createdAt?: string;
  timezone?: string | null;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export const dashboardStats = [
  { label: "Focus score", value: "94%", trend: "+6%" },
  { label: "Tasks done", value: "12", trend: "today" },
  { label: "Streak", value: "47", trend: "days" },
  { label: "AI sessions", value: "8", trend: "this week" },
] as const;

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 2);

export const placeholderTasks: TaskItem[] = [
  {
    id: "1",
    title: "Review Q2 roadmap draft",
    description: "Stakeholder feedback loop",
    category: "work",
    status: "in_progress",
    priority: "high",
    order: 0,
    due: "Today",
    dueDate: new Date().toISOString(),
    reminderEnabled: true,
  },
  {
    id: "2",
    title: "Sync with design on dashboard",
    category: "work",
    status: "todo",
    priority: "medium",
    order: 1,
    due: "Tomorrow",
    dueDate: tomorrow.toISOString(),
  },
  {
    id: "3",
    title: "Ship notification preferences",
    category: "personal",
    status: "todo",
    priority: "low",
    order: 2,
    due: "Fri",
    dueDate: tomorrow.toISOString(),
    recurrenceFrequency: "weekly",
    recurrenceInterval: 1,
  },
  {
    id: "4",
    title: "Weekly focus retrospective",
    category: "learning",
    status: "done",
    priority: "medium",
    order: 3,
    due: "Done",
    completed: true,
  },
  {
    id: "5",
    title: "Missed standup notes",
    category: "work",
    status: "todo",
    priority: "urgent",
    order: 4,
    due: "Overdue",
    dueDate: yesterday.toISOString(),
  },
];

export const placeholderNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Focus block starting",
    body: "Deep work session in 10 minutes — calendar synced.",
    time: "10 min ago",
    read: false,
  },
  {
    id: "2",
    title: "AI schedule updated",
    body: "LifeFlow moved your afternoon meetings to reduce context switching.",
    time: "2 hr ago",
    read: false,
  },
  {
    id: "3",
    title: "Streak milestone",
    body: "47-day productivity streak — keep the flow going.",
    time: "Yesterday",
    read: true,
  },
];

export const analyticsSeries = [
  { day: "Mon", focus: 72, tasks: 8 },
  { day: "Tue", focus: 85, tasks: 11 },
  { day: "Wed", focus: 78, tasks: 9 },
  { day: "Thu", focus: 91, tasks: 12 },
  { day: "Fri", focus: 88, tasks: 10 },
  { day: "Sat", focus: 65, tasks: 5 },
  { day: "Sun", focus: 70, tasks: 6 },
] as const;

export const calendarEvents = [
  { id: "1", title: "Team standup", time: "9:00 AM", type: "meeting" },
  { id: "2", title: "Deep work — LifeFlow", time: "10:30 AM", type: "focus" },
  { id: "3", title: "Lunch + walk", time: "12:30 PM", type: "break" },
  { id: "4", title: "Product review", time: "3:00 PM", type: "meeting" },
] as const;
