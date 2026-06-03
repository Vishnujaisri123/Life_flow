import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/services/api";
import { isApiConfigured } from "@/services/api";
import { placeholderNotifications } from "@/services/placeholders";
import {
  createReminder,
  deleteReminder,
  dismissReminder,
  fetchReminderHistory,
  fetchReminders,
  formatReminderTime,
  getReminderTaskTitle,
  markReminderRead,
  snoozeReminder,
  updateReminder,
  type ApiReminder,
  type ReminderHistoryEntry,
  type ReminderInput,
  type SnoozeMinutes,
} from "@/services/reminderApi";
import {
  createDemoReminder,
  deleteDemoReminder,
  dismissDemoReminder,
  getDemoReminders,
  loadDemoHistory,
  markDemoRead,
  snoozeDemoReminder,
  updateDemoReminder,
} from "@/services/demoReminders";

export type ReminderListItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

function mapRemindersToNotifications(reminders: ApiReminder[]): ReminderListItem[] {
  return reminders.map((r) => ({
    id: r.id,
    title: getReminderTaskTitle(r),
    body: `Scheduled for ${new Date(r.reminderTime).toLocaleString()} · ${r.status}`,
    time: formatReminderTime(r.reminderTime),
    read: r.read,
  }));
}

async function loadReminders(): Promise<ApiReminder[]> {
  if (isApiConfigured()) return fetchReminders();
  return getDemoReminders();
}

async function loadHistory(): Promise<ReminderHistoryEntry[]> {
  if (isApiConfigured()) return fetchReminderHistory();
  return loadDemoHistory();
}

export function useReminderInbox() {
  const apiEnabled = isApiConfigured();

  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: loadReminders,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const historyQuery = useQuery({
    queryKey: ["reminder-history"],
    queryFn: loadHistory,
    staleTime: 30_000,
  });

  const reminders = remindersQuery.data ?? [];
  const history = historyQuery.data ?? [];
  const unreadCount = reminders.filter((r) => !r.read && r.status !== "dismissed").length;

  return {
    reminders,
    history,
    unreadCount,
    items: mapRemindersToNotifications(reminders),
    isLoading: remindersQuery.isLoading,
    isDemo: !apiEnabled,
    refetch: () => {
      void remindersQuery.refetch();
      void historyQuery.refetch();
    },
  };
}

export function useReminders() {
  const inbox = useReminderInbox();

  if (!isApiConfigured()) {
    return {
      items: inbox.items.length ? inbox.items : placeholderNotifications,
      isLoading: inbox.isLoading,
      isDemo: true,
      unreadCount: inbox.unreadCount,
    };
  }

  return {
    items: inbox.items,
    isLoading: inbox.isLoading,
    isDemo: false,
    unreadCount: inbox.unreadCount,
    refetch: inbox.refetch,
  };
}

export function useReminderMutations() {
  const queryClient = useQueryClient();
  const apiEnabled = isApiConfigured();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["reminders"] });
    void queryClient.invalidateQueries({ queryKey: ["reminder-history"] });
  };

  const onError = (err: unknown) => {
    toast.error(err instanceof ApiError ? err.message : "Reminder action failed");
  };

  const createMutation = useMutation({
    mutationFn: (body: ReminderInput) =>
      apiEnabled ? createReminder(body) : Promise.resolve(createDemoReminder(body)),
    onSuccess: () => {
      invalidate();
      toast.success("Reminder saved");
    },
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ReminderInput> }) =>
      apiEnabled
        ? updateReminder(id, body)
        : Promise.resolve(updateDemoReminder(id, body)),
    onSuccess: () => {
      invalidate();
      toast.success("Reminder updated");
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (apiEnabled) {
        await deleteReminder(id);
      } else {
        deleteDemoReminder(id);
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success("Reminder removed");
    },
    onError,
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: SnoozeMinutes }) =>
      apiEnabled ? snoozeReminder(id, minutes) : Promise.resolve(snoozeDemoReminder(id, minutes)),
    onSuccess: () => {
      invalidate();
      toast.success("Reminder snoozed");
    },
    onError,
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) =>
      apiEnabled ? dismissReminder(id) : Promise.resolve(dismissDemoReminder(id)),
    onSuccess: () => {
      invalidate();
      toast.success("Reminder dismissed");
    },
    onError,
  });

  const readMutation = useMutation({
    mutationFn: (id: string) =>
      apiEnabled ? markReminderRead(id) : Promise.resolve(markDemoRead(id)),
    onSuccess: invalidate,
    onError,
  });

  return {
    createReminder: createMutation.mutate,
    updateReminder: updateMutation.mutate,
    deleteReminder: deleteMutation.mutate,
    snoozeReminder: snoozeMutation.mutate,
    dismissReminder: dismissMutation.mutate,
    markRead: readMutation.mutate,
  };
}
