import { useEffect } from "react";
import { Bell, Check, Clock, Play, X, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActiveReminder } from "@/hooks/useReminderScheduler";
import type { SnoozeMinutes } from "@/services/reminderApi";
import { useTaskMutations } from "@/hooks/useTasks";
import { getReminderTaskId } from "@/services/reminderApi";

type FullScreenAlertProps = {
  reminder: ActiveReminder | null;
  onSnooze: (minutes: SnoozeMinutes) => Promise<void>;
  onDismiss: () => Promise<void>;
};

export function FullScreenAlert({
  reminder,
  onSnooze,
  onDismiss,
}: FullScreenAlertProps) {
  const { completeTask } = useTaskMutations();

  useEffect(() => {
    if (!reminder) return;
    
    // Check if vibration is enabled for this task
    let shouldVibrate = true;
    if (typeof reminder.taskId === "object" && reminder.taskId !== null) {
      if (reminder.taskId.vibrationEnabled === false) {
        shouldVibrate = false;
      }
    }

    if (shouldVibrate && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 500]);
    }
  }, [reminder]);

  if (!reminder) return null;

  const handleComplete = async () => {
    const taskId = getReminderTaskId(reminder);
    if (taskId) {
      completeTask(taskId);
    }
    await onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 p-4 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute top-8 right-8">
        <Button variant="ghost" size="icon" onClick={() => void onDismiss()} aria-label="Dismiss">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-primary/20 text-primary shadow-[0_0_40px_rgba(var(--primary),0.4)]">
          <Bell className="h-12 w-12" />
        </div>

        <h1 className="mb-2 text-4xl font-bold tracking-tight text-gradient">
          {reminder.taskTitle}
        </h1>

        <div className="mb-8 flex items-center gap-2 text-xl font-medium text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span>{new Date(reminder.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <p className="mb-12 text-lg text-muted-foreground">
          It's time to focus. Are you ready to begin?
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[300px]">
          <Button size="lg" className="h-14 w-full text-lg shadow-[var(--shadow-glow-cyan)]" onClick={() => void onDismiss()}>
            <Play className="mr-2 h-5 w-5" />
            Start Task Now
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 border-primary/40" onClick={() => void onSnooze(10)}>
              <CalendarClock className="mr-2 h-4 w-4" />
              Snooze 10m
            </Button>
            <Button variant="outline" className="h-12 border-primary/40" onClick={() => void onSnooze(30)}>
              <CalendarClock className="mr-2 h-4 w-4" />
              Snooze 30m
            </Button>
          </div>

          <Button variant="secondary" className="mt-2 h-12" onClick={() => void handleComplete()}>
            <Check className="mr-2 h-4 w-4" />
            Mark Complete
          </Button>
        </div>
      </div>
    </div>
  );
}
