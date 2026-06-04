import { useEffect, useState } from "react";
import { Bell, Check, Clock, Play, X, CalendarClock, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActiveReminder } from "@/hooks/useReminderScheduler";
import type { SnoozeMinutes } from "@/services/reminderApi";
import { useTaskMutations } from "@/hooks/useTasks";
import { getReminderTaskId } from "@/services/reminderApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ReminderModalProps = {
  reminder: ActiveReminder | null;
  onSnooze: (minutes: SnoozeMinutes) => Promise<void>;
  onDismiss: () => Promise<void>;
  onClose: () => void;
};

export function ReminderModal({
  reminder,
  onSnooze,
  onDismiss,
  onClose,
}: ReminderModalProps) {
  const { startTask, completeTask } = useTaskMutations();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Vibration on mount/trigger if enabled
  useEffect(() => {
    if (!reminder) return;
    
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

  const baseTimeStr = (typeof reminder?.taskId === "object" && reminder?.taskId !== null
    ? reminder.taskId.startTime || reminder.taskId.dueDate
    : null) || reminder?.reminderTime;

  // Live ticking countdown to the task start time
  useEffect(() => {
    if (!baseTimeStr) return;

    const updateCountdown = () => {
      const diffMs = new Date(baseTimeStr).getTime() - Date.now();
      setSecondsLeft(Math.round(diffMs / 1000));
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [baseTimeStr]);

  if (!reminder) return null;

  const handleStartTask = async () => {
    const taskId = getReminderTaskId(reminder);
    if (taskId) {
      startTask(taskId);
    }
    await onDismiss();
    onClose();
  };

  const handleComplete = async () => {
    const taskId = getReminderTaskId(reminder);
    if (taskId) {
      completeTask(taskId);
    }
    await onDismiss();
    onClose();
  };

  const handleSnoozeClick = async (mins: SnoozeMinutes) => {
    await onSnooze(mins);
    onClose();
  };

  const formatCountdown = (totalSecs: number) => {
    if (totalSecs < 0) {
      const absSecs = Math.abs(totalSecs);
      const mins = Math.floor(absSecs / 60);
      if (mins === 0) return "Starting now";
      return `Started ${mins} min ago`;
    }
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s remaining`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s remaining`;
    }
    return `${secs}s remaining`;
  };

  const formattedStartTime = baseTimeStr
    ? new Date(baseTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "";

  const description = typeof reminder.taskId === "object" && reminder.taskId !== null
    ? reminder.taskId.description
    : "";

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass border-primary/40 max-w-md p-6 shadow-[var(--shadow-glow-cyan)] text-center">
        <DialogHeader className="relative flex flex-col items-center">
          <div className="absolute top-0 right-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-primary/20 text-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]">
            <Bell className="h-8 w-8" />
          </div>
          
          <DialogTitle id="reminder-modal-title" className="text-2xl font-bold tracking-tight text-gradient">
            {reminder.taskTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2 text-center">
          {/* Start Time Display */}
          <div className="flex items-center justify-center gap-2 text-base font-semibold text-primary">
            <Clock className="h-4 w-4" />
            <span>Scheduled for {formattedStartTime}</span>
          </div>

          {/* Live Countdown Display */}
          {secondsLeft !== null && (
            <div className="inline-block rounded-full bg-secondary/60 border border-border/50 px-4 py-1 text-sm font-semibold text-gradient">
              {formatCountdown(secondsLeft)}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="rounded-lg bg-background/50 border border-border/40 p-3 text-left">
              <div className="flex items-start gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <AlignLeft className="h-3.5 w-3.5 mt-0.5" />
                <span>Description</span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{description}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" className="h-12 w-full text-base font-semibold shadow-[var(--shadow-glow-cyan)]" onClick={() => void handleStartTask()}>
            <Play className="mr-2 h-4 w-4" />
            Start Task
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 border-primary/30 text-sm font-medium" onClick={() => void handleSnoozeClick(5)}>
              <CalendarClock className="mr-1.5 h-4 w-4" />
              Snooze 5m
            </Button>
            <Button variant="outline" className="h-11 border-primary/30 text-sm font-medium" onClick={() => void handleSnoozeClick(10)}>
              <CalendarClock className="mr-1.5 h-4 w-4" />
              Snooze 10m
            </Button>
          </div>

          <Button variant="secondary" className="h-11 text-sm font-medium" onClick={() => void handleComplete()}>
            <Check className="mr-1.5 h-4 w-4" />
            Mark Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
