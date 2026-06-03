import { Bell, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ActiveReminder } from "@/hooks/useReminderScheduler";
import type { SnoozeMinutes } from "@/services/reminderApi";
import { cn } from "@/lib/utils";

const SNOOZE_OPTIONS: { minutes: SnoozeMinutes; label: string }[] = [
  { minutes: 5, label: "5 min" },
  { minutes: 15, label: "15 min" },
  { minutes: 60, label: "1 hr" },
];

type ReminderPopupProps = {
  reminder: ActiveReminder | null;
  onSnooze: (minutes: SnoozeMinutes) => Promise<void>;
  onDismiss: () => Promise<void>;
  onClose: () => void;
};

function PopupCard({
  reminder,
  onSnooze,
  onDismiss,
  onClose,
  className,
}: ReminderPopupProps & { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/40 bg-background/95 p-5 shadow-[var(--shadow-glow-cyan)] backdrop-blur-md",
        className,
      )}
      role="alertdialog"
      aria-labelledby="reminder-popup-title"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 id="reminder-popup-title" className="font-semibold">
            Reminder
          </h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-2 text-lg font-medium">{reminder?.taskTitle}</p>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {reminder && new Date(reminder.reminderTime).toLocaleString()}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {SNOOZE_OPTIONS.map((opt) => (
          <Button
            key={opt.minutes}
            variant="outline"
            size="sm"
            className="min-h-10 min-w-[4.5rem] touch-manipulation"
            onClick={() => void onSnooze(opt.minutes)}
          >
            Snooze {opt.label}
          </Button>
        ))}
        <Button
          size="sm"
          className="min-h-10 touch-manipulation"
          onClick={() => void onDismiss()}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

export function ReminderPopup(props: ReminderPopupProps) {
  const { reminder } = props;
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!reminder) return null;

  if (isMobile) {
    return (
      <Sheet open onOpenChange={(open) => !open && props.onClose()}>
        <SheetContent side="bottom" className="rounded-t-2xl border-primary/30 pb-8">
          <SheetHeader className="sr-only">
            <SheetTitle>Reminder</SheetTitle>
            <SheetDescription>{reminder.taskTitle}</SheetDescription>
          </SheetHeader>
          <PopupCard {...props} className="border-0 bg-transparent p-0 shadow-none" />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="fixed right-6 top-20 z-[70] w-full max-w-sm animate-in slide-in-from-right-4">
      <PopupCard {...props} />
    </div>
  );
}
