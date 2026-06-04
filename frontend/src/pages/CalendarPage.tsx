import React, { useState, useMemo } from "react";
import { Plus, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { PageShell } from "@/components/page/PageShell";
import { LoadingSkeleton } from "@/components/page/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks, useTaskMutations } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";
import type { TaskItem } from "@/services/placeholders";
import { getISTDateKey } from "@/utils/ist";

export function CalendarPage() {
  const { tasks, isLoading } = useTasks();
  const { updateTask } = useTaskMutations();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskItem[]>();
    tasks.forEach((task) => {
      const dateStr = task.dueDate || task.endTime || task.startTime;
      if (!dateStr) return;
      const key = getISTDateKey(new Date(dateStr));
      if (!key) return;
      const list = map.get(key) || [];
      list.push(task);
      map.set(key, list);
    });
    return map;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      updateTask({ id: taskId, body: { dueDate: dateStr } as any });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <PageShell
      title="Calendar"
      description="Plan your days and drag tasks to reschedule."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-sm min-w-[120px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <Card className="glass border-border/60">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border/60">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {daysInMonth.map((day, i) => {
              const dateStr = getISTDateKey(day);
              const dayTasks = tasksByDate.get(dateStr) || [];
              const todayKey = getISTDateKey(new Date());
              return (
                <div
                  key={day.toISOString()}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dateStr)}
                  className={cn(
                    "min-h-[120px] border-b border-r border-border/60 p-2 transition-colors hover:bg-muted/10",
                    !isSameMonth(day, currentDate) && "bg-muted/5 opacity-50",
                    dateStr === todayKey && "bg-primary/5",
                    i % 7 === 6 && "border-r-0"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday(day) && "bg-primary text-primary-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={cn(
                          "cursor-move truncate rounded px-1.5 py-0.5 text-xs font-medium shadow-sm transition-opacity hover:opacity-80",
                          task.priority === "high"
                            ? "bg-red-500/10 text-red-500"
                            : task.priority === "medium"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-blue-500/10 text-blue-500"
                        )}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
