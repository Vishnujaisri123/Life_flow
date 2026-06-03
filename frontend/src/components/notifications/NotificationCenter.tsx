import { Bell, Check, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useReminderInbox, useReminderMutations } from "@/hooks/useReminders";
import { useReminderContext } from "@/context/ReminderContext";
import {
  dismissReminder,
  formatReminderTime,
  getReminderTaskTitle,
  markReminderRead,
  snoozeReminder,
  type ApiReminder,
  type SnoozeMinutes,
} from "@/services/reminderApi";
import { isApiConfigured } from "@/services/api";
import {
  dismissDemoReminder,
  markDemoRead,
  snoozeDemoReminder,
} from "@/services/demoReminders";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SNOOZE: { minutes: SnoozeMinutes; label: string }[] = [
  { minutes: 5, label: "5m" },
  { minutes: 15, label: "15m" },
  { minutes: 60, label: "1h" },
];

function ReminderRow({ reminder }: { reminder: ApiReminder }) {
  const apiEnabled = isApiConfigured();
  const { deleteReminder } = useReminderMutations();
  const title = getReminderTaskTitle(reminder);

  const snooze = async (minutes: SnoozeMinutes) => {
    if (apiEnabled) await snoozeReminder(reminder.id, minutes);
    else snoozeDemoReminder(reminder.id, minutes);
    toast.success(`Snoozed ${minutes} minutes`);
  };

  const dismiss = async () => {
    if (apiEnabled) await dismissReminder(reminder.id);
    else dismissDemoReminder(reminder.id);
    toast.success("Dismissed");
  };

  const markRead = async () => {
    if (apiEnabled) await markReminderRead(reminder.id);
    else markDemoRead(reminder.id);
  };

  return (
    <Card
      className={cn(
        "glass border-border/60",
        !reminder.read && "border-primary/30 shadow-[var(--shadow-glow-cyan)]",
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{title}</p>
              {!reminder.read && (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  New
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {new Date(reminder.reminderTime).toLocaleString()}
              <span className="text-xs">· {reminder.soundType}</span>
            </p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">
              {reminder.status} · {reminder.notificationType}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 touch-manipulation">
            {reminder.status !== "dismissed" && (
              <>
                {SNOOZE.map((s) => (
                  <Button
                    key={s.minutes}
                    variant="outline"
                    size="sm"
                    className="min-h-9"
                    onClick={() => void snooze(s.minutes)}
                  >
                    {s.label}
                  </Button>
                ))}
                <Button size="sm" variant="secondary" className="min-h-9" onClick={() => void dismiss()}>
                  Dismiss
                </Button>
              </>
            )}
            {!reminder.read && (
              <Button size="sm" variant="ghost" className="min-h-9" onClick={() => void markRead()}>
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="min-h-9 text-destructive"
              onClick={() => deleteReminder(reminder.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryRow({
  entry,
}: {
  entry: {
    id: string;
    triggeredAt: string;
    dismissedAt?: string | null;
    snoozedCount: number;
    taskId?: string | { title?: string };
  };
}) {
  const title =
    typeof entry.taskId === "object" && entry.taskId && "title" in entry.taskId
      ? (entry.taskId as { title?: string }).title
      : "Task reminder";

  return (
    <Card className="glass border-border/60 opacity-90">
      <CardContent className="p-4">
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Triggered {formatReminderTime(entry.triggeredAt)}
          {entry.dismissedAt && ` · dismissed ${formatReminderTime(entry.dismissedAt)}`}
          {entry.snoozedCount > 0 && ` · snoozed ×${entry.snoozedCount}`}
        </p>
      </CardContent>
    </Card>
  );
}

export function NotificationCenter() {
  const { reminders, history, unreadCount, isLoading, isDemo, refetch } = useReminderInbox();
  const { setOpenScheduler } = useReminderContext();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading notifications…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isDemo ? "Demo reminders stored locally." : "Reminders synced with your account."}
        </p>
        <Button size="sm" className="w-full sm:w-auto touch-manipulation" onClick={() => setOpenScheduler(true)}>
          <Bell className="mr-2 h-4 w-4" />
          New reminder
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass h-auto p-1">
          <TabsTrigger value="all" className="min-h-10 touch-manipulation">
            All
            {unreadCount > 0 && (
              <Badge className="ml-2 h-5 min-w-5 px-1" variant="default">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reminders" className="min-h-10 touch-manipulation">
            Reminders
          </TabsTrigger>
          <TabsTrigger value="history" className="min-h-10 touch-manipulation">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {reminders.length === 0 && history.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No notifications yet.</p>
          ) : (
            <>
              {reminders.map((r) => (
                <ReminderRow key={r.id} reminder={r} />
              ))}
              {history.slice(0, 5).map((h) => (
                <HistoryRow key={h.id} entry={h} />
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="reminders" className="mt-4 space-y-3">
          {reminders.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No active reminders.</p>
          ) : (
            reminders.map((r) => <ReminderRow key={r.id} reminder={r} />)
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No history yet.</p>
          ) : (
            history.map((h) => <HistoryRow key={h.id} entry={h} />)
          )}
        </TabsContent>
      </Tabs>

      <Button variant="ghost" size="sm" className="w-full" onClick={() => void refetch?.()}>
        Refresh
      </Button>
    </div>
  );
}
