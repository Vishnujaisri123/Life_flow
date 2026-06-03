import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, Calendar, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TaskItem } from "@/services/placeholders";
import { ROUTES } from "@/routes/paths";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ActiveTaskWidget({ tasks }: { tasks: TaskItem[] }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeTask = tasks.find(t => {
    if (!t.startTime || !t.endTime) return false;
    const start = new Date(t.startTime);
    const end = new Date(t.endTime);
    return now >= start && now <= end && t.status !== "done";
  });

  if (!activeTask) return null;

  const start = new Date(activeTask.startTime!).getTime();
  const end = new Date(activeTask.endTime!).getTime();
  const total = end - start;
  const elapsed = now.getTime() - start;
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));

  const timeLeftMs = end - now.getTime();
  const minsLeft = Math.ceil(timeLeftMs / 60000);

  return (
    <Card className="glass border-primary/50 shadow-[var(--shadow-glow-cyan)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Clock className="h-4 w-4 text-primary" />
          Active Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end mb-2">
          <div>
            <div className="font-semibold">{activeTask.title}</div>
            <div className="text-xs text-muted-foreground">{minsLeft} mins remaining</div>
          </div>
          <div className="text-xl font-bold text-gradient">{Math.round(percent)}%</div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${percent}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

export function MissedTasksWidget({ missed }: { missed: TaskItem[] }) {
  if (missed.length === 0) return null;

  return (
    <Card className="glass border-destructive/50 bg-destructive/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Missed Tasks ({missed.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-40 overflow-y-auto">
        {missed.slice(0, 3).map(task => (
          <div key={task.id} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
            <span className="text-sm">{task.title}</span>
            <span className="text-xs text-destructive">{task.dueDate ? formatTime(task.dueDate) : "Overdue"}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TodaysScheduleWidget({ today }: { today: TaskItem[] }) {
  const scheduled = today.filter(t => t.startTime).sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());

  return (
    <Card className="glass border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4" />
          Today's Schedule
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.calendar}>
            Full
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {scheduled.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nothing scheduled for today.</p>
        ) : (
          <div className="relative border-l border-border/50 pl-4 space-y-4 ml-2">
            {scheduled.slice(0, 4).map(task => (
              <div key={task.id} className="relative">
                <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                <div className="text-sm font-medium">{task.title}</div>
                <div className="text-xs text-muted-foreground">
                  {formatTime(task.startTime!)} {task.endTime ? `- ${formatTime(task.endTime)}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UpcomingReminderWidget({ tasks }: { tasks: TaskItem[] }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const upcoming = tasks
    .filter(t => t.reminderEnabled && t.startTime && t.status !== "done")
    .map(t => {
      const start = new Date(t.startTime!).getTime();
      const trigger = start - (t.reminderBefore ?? 0) * 60_000;
      return { ...t, triggerTime: trigger };
    })
    .filter(t => t.triggerTime > now.getTime())
    .sort((a, b) => a.triggerTime - b.triggerTime)[0];

  if (!upcoming) return null;

  const mins = Math.ceil((upcoming.triggerTime - now.getTime()) / 60000);

  return (
    <Card className="glass border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Bell className="h-4 w-4" />
          Upcoming Reminder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-semibold text-lg">{upcoming.title}</div>
        <div className="text-sm text-muted-foreground">Alert in {mins} {mins === 1 ? 'minute' : 'minutes'}</div>
      </CardContent>
    </Card>
  );
}
