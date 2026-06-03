import { isBefore, isToday, parseISO, startOfDay } from "date-fns";
import type { TaskItem } from "@/services/placeholders";
import type { AiTaskContext } from "@/types/ai";

function getDueDate(task: TaskItem): Date | null {
  const raw = task.dueDate ?? task.endTime;
  if (!raw) return null;
  const d = parseISO(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function buildTaskContextFromItems(tasks: TaskItem[]): AiTaskContext {
  const open = tasks.filter((t) => t.status !== "done" && !t.completed);
  const todayStart = startOfDay(new Date());

  const todayTasks = open.filter((t) => {
    const due = getDueDate(t);
    if (!due) return t.due === "Today";
    return isToday(due);
  });

  let overdueCount = 0;
  const overdueTitles: string[] = [];
  const upcomingTitles: string[] = [];

  for (const task of open) {
    const due = getDueDate(task);
    if (!due) continue;
    const dueDay = startOfDay(due);
    if (isBefore(dueDay, todayStart)) {
      overdueCount += 1;
      if (overdueTitles.length < 8) overdueTitles.push(task.title);
    } else if (!isToday(due) && upcomingTitles.length < 8) {
      upcomingTitles.push(task.title);
    }
  }

  const highPriority = open
    .filter((t) => t.priority === "high" || t.priority === "urgent")
    .map((t) => t.title)
    .slice(0, 6);

  return {
    todayCount: todayTasks.length,
    todayTitles: todayTasks.map((t) => t.title).slice(0, 12),
    overdueCount,
    overdueTitles,
    upcomingTitles,
    openCount: open.length,
    highPriority,
  };
}
