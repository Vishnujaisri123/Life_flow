import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isApiConfigured } from "@/services/api";
import {
  dismissReminder,
  fetchDueReminders,
  getReminderTaskTitle,
  markReminderTriggered,
  snoozeReminder,
  type ApiReminder,
  type SnoozeMinutes,
} from "@/services/reminderApi";
import {
  dismissDemoReminder,
  getDemoDueReminders,
  markDemoTriggered,
  snoozeDemoReminder,
} from "@/services/demoReminders";
import { playReminderSound } from "@/services/reminderSound";
import { useBrowserNotifications } from "@/hooks/useBrowserNotifications";

export type ActiveReminder = ApiReminder & { taskTitle: string };

const POLL_MS = 30_000;
const firedSession = new Set<string>();

type SchedulerHandlers = {
  onTrigger: (reminder: ActiveReminder) => void;
};

export function useReminderScheduler(
  enabled: boolean,
  { onTrigger }: SchedulerHandlers,
) {
  const apiEnabled = isApiConfigured();
  const queryClient = useQueryClient();
  const { showNotification, permission } = useBrowserNotifications();
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  const fireReminder = useCallback(
    async (reminder: ApiReminder) => {
      if (firedSession.has(reminder.id)) return;
      firedSession.add(reminder.id);

      const taskTitle = getReminderTaskTitle(reminder);
      const active: ActiveReminder = { ...reminder, taskTitle };

      if (reminder.soundType !== "silent") {
        void playReminderSound(reminder.soundType);
      }

      if (permission === "granted") {
        showNotification(`Reminder: ${taskTitle}`, {
          body: `Scheduled for ${new Date(reminder.reminderTime).toLocaleString()}`,
          tag: reminder.id,
          requireInteraction: true,
        });
      }

      onTriggerRef.current(active);

      if (apiEnabled) {
        try {
          await markReminderTriggered(reminder.id);
          void queryClient.invalidateQueries({ queryKey: ["reminders"] });
          void queryClient.invalidateQueries({ queryKey: ["reminder-history"] });
        } catch {
          firedSession.delete(reminder.id);
        }
      } else {
        markDemoTriggered(reminder.id);
      }
    },
    [apiEnabled, permission, queryClient, showNotification],
  );

  const checkDue = useCallback(async () => {
    if (!enabled) return;

    let due: ApiReminder[] = [];
    if (apiEnabled) {
      try {
        due = await fetchDueReminders();
      } catch {
        return;
      }
    } else {
      due = getDemoDueReminders();
    }

    for (const r of due) {
      if (r.status === "dismissed") continue;
      await fireReminder(r);
    }
  }, [apiEnabled, enabled, fireReminder]);

  useEffect(() => {
    if (!enabled) return;
    void checkDue();
    const id = setInterval(() => void checkDue(), POLL_MS);
    return () => clearInterval(id);
  }, [enabled, checkDue]);

  const snooze = useCallback(
    async (id: string, minutes: SnoozeMinutes) => {
      firedSession.delete(id);
      if (apiEnabled) {
        await snoozeReminder(id, minutes);
        void queryClient.invalidateQueries({ queryKey: ["reminders"] });
      } else {
        snoozeDemoReminder(id, minutes);
      }
    },
    [apiEnabled, queryClient],
  );

  const dismiss = useCallback(
    async (id: string) => {
      firedSession.delete(id);
      if (apiEnabled) {
        await dismissReminder(id);
        void queryClient.invalidateQueries({ queryKey: ["reminders"] });
        void queryClient.invalidateQueries({ queryKey: ["reminder-history"] });
      } else {
        dismissDemoReminder(id);
      }
    },
    [apiEnabled, queryClient],
  );

  return { snooze, dismiss, checkDue };
}
