import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, GripVertical, Pencil, Repeat, Trash2, Clock, Bell, Calendar, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCategoryLabel, priorityBadgeClass } from "@/components/tasks/constants";
import { getStatusStyle } from "@/components/tasks/taskStatus";
import type { TaskItem } from "@/services/placeholders";
import { formatISTDate, formatISTTime } from "@/utils/ist";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: TaskItem;
  index: number;
  draggable?: boolean;
  apiEnabled?: boolean;
  isDragging?: boolean;
  isOver?: boolean;
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  onComplete?: (id: string) => void;
  onEdit?: (task: TaskItem) => void;
  onDelete?: (task: TaskItem) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onClick?: (task: TaskItem) => void;
};

function fmt(iso: string) {
  return formatISTTime(iso);
}
function fmtDate(iso: string) {
  return formatISTDate(iso);
}
function computeReminderTime(task: TaskItem): string | null {
  const base = task.startTime ?? task.dueDate;
  if (!base || task.reminderBefore == null) return null;
  return formatISTTime(new Date(new Date(base).getTime() - task.reminderBefore * 60_000).toISOString());
}
function computeDuration(task: TaskItem): string | null {
  if (task.duration) {
    const h = Math.floor(task.duration / 60), m = task.duration % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    return h > 0 ? `${h} Hour${h > 1 ? "s" : ""}` : `${m} min`;
  }
  if (task.startTime && task.endTime) {
    const ms = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
    if (ms <= 0) return null;
    const total = Math.round(ms / 60_000), h = Math.floor(total / 60), m = total % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    return h > 0 ? `${h} Hour${h > 1 ? "s" : ""}` : `${m} min`;
  }
  return null;
}

export function TaskCard({
  task, index, draggable = false, apiEnabled = false,
  isDragging, isOver, onDragStart, onDragEnd, onDragOver, onDrop,
  onComplete, onEdit, onDelete, onMoveUp, onMoveDown, onClick,
}: TaskCardProps) {
  const [celebrate, setCelebrate] = useState(false);
  const isDone = task.status === "done" || task.completed;
  const status = getStatusStyle(task);
  const reminderTime = computeReminderTime(task);
  const duration = computeDuration(task);
  const dateStr = task.dueDate ?? task.endTime ?? task.startTime;

  function handleComplete() {
    if (!apiEnabled || isDone) return;
    setCelebrate(true);
    onComplete?.(task.id);
    setTimeout(() => setCelebrate(false), 1200);
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn("list-none", isDragging && "opacity-50", isOver && "ring-1 ring-primary/50 rounded-xl")}
    >
      <Card
        draggable={draggable && apiEnabled}
        onDragStart={() => onDragStart?.(index)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onDragOver?.(e, index)}
        onDrop={(e) => onDrop?.(e, index)}
        className={cn(
          "glass border-border/60 transition-all hover:border-primary/30 cursor-pointer",
          status.cardBorderClass,
          status.cardBgClass,
        )}
        onClick={() => onClick?.(task)}
      >
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
          {draggable && apiEnabled && (
            <button
              type="button"
              className="hidden sm:flex shrink-0 cursor-grab touch-none text-muted-foreground hover:text-primary p-1"
              aria-label="Drag to reorder"
              onMouseDown={(e) => { e.stopPropagation(); onDragStart?.(index); }}
            >
              <GripVertical className="h-5 w-5" />
            </button>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            {/* Title + status badge */}
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("font-medium", isDone && "text-muted-foreground line-through")}>
                {task.title}
              </p>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wider", status.badgeClass)}>
                {status.label}
              </span>
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
            )}

            {/* Date + time info — always visible, flex-wrap for mobile */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {dateStr && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {fmtDate(dateStr)}
                </span>
              )}
              {task.startTime && (
                <span className="flex items-center gap-1 text-primary/80">
                  <Clock className="h-3 w-3 shrink-0" />
                  {fmt(task.startTime)}{task.endTime && ` – ${fmt(task.endTime)}`}
                </span>
              )}
              {duration && (
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 shrink-0" />
                  {duration}
                </span>
              )}
              {task.reminderEnabled && reminderTime && (
                <span className="flex items-center gap-1 text-amber-400/80">
                  <Bell className="h-3 w-3 shrink-0" />
                  Reminder: {reminderTime}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className={priorityBadgeClass[task.priority]}>
                {task.priority}
              </Badge>
              {task.category && (
                <Badge variant="secondary" className="text-xs">
                  {formatCategoryLabel(task.category)}
                </Badge>
              )}
              {task.recurrenceFrequency && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Repeat className="h-3 w-3" />
                  {task.recurrenceFrequency}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-1 sm:flex-col sm:items-end" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1 sm:hidden w-full justify-between">
              <Button variant="outline" size="sm" onClick={onMoveUp} disabled={!onMoveUp}>↑</Button>
              <Button variant="outline" size="sm" onClick={onMoveDown} disabled={!onMoveDown}>↓</Button>
            </div>
            <div className="flex gap-1">
              {apiEnabled && !isDone && (
                <Button
                  variant="outline"
                  size="icon"
                  className={cn("h-9 w-9 relative overflow-hidden", celebrate && "border-primary shadow-[var(--shadow-glow-cyan)]")}
                  aria-label="Complete task"
                  onClick={handleComplete}
                >
                  <Check className="h-4 w-4" />
                  <AnimatePresence>
                    {celebrate && (
                      <motion.span
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-full bg-primary/40"
                      />
                    )}
                  </AnimatePresence>
                </Button>
              )}
              {apiEnabled && (
                <>
                  <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Edit task" onClick={() => onEdit?.(task)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" aria-label="Delete task" onClick={() => onDelete?.(task)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.li>
  );
}
