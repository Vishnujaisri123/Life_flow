import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, Calendar, Clock, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TaskItem } from "@/services/placeholders";
import { ROUTES } from "@/routes/paths";
import { useReminderInbox } from "@/hooks/useReminders";
import { useReminderContext } from "@/context/ReminderContext";

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

export function DashboardRemindersWidget() {
  const { reminders } = useReminderInbox();
  const { setOpenScheduler } = useReminderContext();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  const activeReminders = reminders.filter(r => r.status !== "dismissed");

  // Missed reminders: reminderTime or snoozeTime is in the past
  const missed = activeReminders.filter(r => {
    const time = r.snoozeUntil ? new Date(r.snoozeUntil) : new Date(r.reminderTime);
    return time <= now;
  }).sort((a, b) => new Date(b.reminderTime).getTime() - new Date(a.reminderTime).getTime());

  // Upcoming reminders: reminderTime is in the future
  const upcoming = activeReminders.filter(r => {
    const time = r.snoozeUntil ? new Date(r.snoozeUntil) : new Date(r.reminderTime);
    return time > now;
  }).sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime());

  const nextReminder = upcoming[0] || null;
  const otherUpcoming = upcoming.slice(1, 4);

  const formatTaskTime = (iso: string) => {
    return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getTitle = (r: any) => {
    if (typeof r.taskId === "object" && r.taskId !== null) {
      return r.taskId.title || "Untitled Task";
    }
    return "Task";
  };

  return (
    <div className="space-y-4">
      {nextReminder && (
        <Card className="glass border-primary/40 bg-primary/5 shadow-[var(--shadow-glow-cyan)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4 text-primary animate-bounce" />
              Next Reminder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold text-lg">{getTitle(nextReminder)}</div>
            <div className="text-sm text-muted-foreground">
              Alert at {formatTaskTime(nextReminder.snoozeUntil || nextReminder.reminderTime)}
            </div>
          </CardContent>
        </Card>
      )}

      {missed.length > 0 && (
        <Card className="glass border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
              Missed Reminders ({missed.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {missed.slice(0, 3).map(r => (
              <div key={r.id} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{getTitle(r)}</span>
                  <span className="text-xs text-muted-foreground">
                    Was scheduled for {formatTaskTime(r.reminderTime)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-destructive px-2 py-0.5 rounded-full bg-destructive/10">
                  Missed
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="glass border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Upcoming Reminders
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setOpenScheduler(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {otherUpcoming.length === 0 && !nextReminder ? (
            <p className="text-xs text-muted-foreground">No upcoming reminders scheduled.</p>
          ) : (
            <div className="space-y-2.5">
              {otherUpcoming.map(r => (
                <div key={r.id} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{getTitle(r)}</span>
                    <span className="text-xs text-muted-foreground">
                      Reminding at {formatTaskTime(r.snoozeUntil || r.reminderTime)}
                    </span>
                  </div>
                  <span className="text-xs text-primary px-2 py-0.5 rounded-full bg-primary/10">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

