import { Calendar, Clock, Bell, Tag, Zap, Info, CheckCircle2, Pencil, Trash2, CalendarClock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { priorityBadgeClass } from "@/components/tasks/constants";
import type { TaskItem } from "@/services/placeholders";
import { cn } from "@/lib/utils";

type Props = {
  task: TaskItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (task: TaskItem) => void;
  onComplete: (id: string) => void;
  onDelete: (task: TaskItem) => void;
  apiEnabled?: boolean;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
function reminderTime(task: TaskItem): string | null {
  const base = task.startTime ?? task.dueDate;
  if (!base || task.reminderBefore == null) return null;
  return new Date(new Date(base).getTime() - task.reminderBefore * 60_000)
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function duration(task: TaskItem): string | null {
  if (task.duration) {
    const h = Math.floor(task.duration / 60), m = task.duration % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h} Hour${h > 1 ? "s" : ""}`) : `${m} min`;
  }
  if (task.startTime && task.endTime) {
    const ms = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
    if (ms <= 0) return null;
    const t = Math.round(ms / 60_000), h = Math.floor(t / 60), m = t % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h} Hour${h > 1 ? "s" : ""}`) : `${m} min`;
  }
  return null;
}

function Row({ icon, label, value, className }: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
      <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <span className={cn("text-sm font-medium flex-1", className)}>{value}</span>
    </div>
  );
}

export function TaskDetailModal({ task, open, onOpenChange, onEdit, onComplete, onDelete, apiEnabled }: Props) {
  if (!task) return null;
  const isDone = task.status === "done" || task.completed;
  const rt = reminderTime(task);
  const dur = duration(task);
  const dateStr = task.dueDate ?? task.endTime ?? task.startTime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/60 max-h-[90vh] overflow-y-auto w-[calc(100vw-1.5rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base pr-6">
            {task.title}
            {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 py-1">
          {task.description && (
            <Row icon={<Info className="h-4 w-4" />} label="Description" value={task.description} />
          )}
          {dateStr && (
            <Row icon={<Calendar className="h-4 w-4" />} label="Date" value={fmtDate(dateStr)} />
          )}
          {task.startTime && (
            <Row
              icon={<Clock className="h-4 w-4 text-primary" />}
              label="Time"
              value={`${fmt(task.startTime)}${task.endTime ? ` – ${fmt(task.endTime)}` : ""}`}
              className="text-primary/90"
            />
          )}
          {dur && (
            <Row icon={<Zap className="h-4 w-4" />} label="Duration" value={dur} />
          )}
          {rt && task.reminderEnabled && (
            <Row icon={<Bell className="h-4 w-4 text-amber-400" />} label="Reminder" value={rt} className="text-amber-400" />
          )}
          {task.category && (
            <Row icon={<Tag className="h-4 w-4" />} label="Category" value={task.category} />
          )}
          <div className="flex items-start gap-3 py-2 border-b border-border/40">
            <span className="mt-0.5 text-muted-foreground shrink-0"><Info className="h-4 w-4" /></span>
            <span className="text-xs text-muted-foreground w-24 shrink-0">Priority</span>
            <Badge variant="outline" className={cn("text-xs", priorityBadgeClass[task.priority])}>
              {task.priority}
            </Badge>
          </div>
          <div className="flex items-start gap-3 py-2">
            <span className="mt-0.5 text-muted-foreground shrink-0"><CalendarClock className="h-4 w-4" /></span>
            <span className="text-xs text-muted-foreground w-24 shrink-0">Status</span>
            <span className="text-sm font-medium capitalize">{task.status.replace("_", " ")}</span>
          </div>
        </div>

        {apiEnabled && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
            {!isDone && (
              <Button size="sm" className="flex-1" onClick={() => { onComplete(task.id); onOpenChange(false); }}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Complete
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex-1" onClick={() => { onEdit(task); onOpenChange(false); }}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { onDelete(task); onOpenChange(false); }}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
