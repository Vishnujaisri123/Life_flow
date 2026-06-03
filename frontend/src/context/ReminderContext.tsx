import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { isApiConfigured } from "@/services/api";
import { seedDemoRemindersIfEmpty } from "@/services/demoReminders";
import { placeholderTasks } from "@/services/placeholders";
import { useFCM } from "@/hooks/useFCM";
import { useReminderScheduler, type ActiveReminder } from "@/hooks/useReminderScheduler";
import { ReminderPopup } from "@/components/notifications/ReminderPopup";
import { FullScreenAlert } from "@/components/notifications/FullScreenAlert";
import { BrowserNotificationPrompt } from "@/components/notifications/BrowserNotificationPrompt";
import { ReminderScheduler } from "@/components/notifications/ReminderScheduler";
import type { SnoozeMinutes } from "@/services/reminderApi";

type ReminderContextValue = {
  activePopup: ActiveReminder | null;
  dismissPopup: () => void;
  snoozeActive: (minutes: SnoozeMinutes) => Promise<void>;
  dismissActive: () => Promise<void>;
  openScheduler: boolean;
  setOpenScheduler: (open: boolean) => void;
};

const ReminderContext = createContext<ReminderContextValue | null>(null);

export function ReminderProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isDemo } = useAuth();
  const enabled = isAuthenticated;
  const [activePopup, setActivePopup] = useState<ActiveReminder | null>(null);
  const [openScheduler, setOpenScheduler] = useState(false);

  useFCM(enabled && !isDemo);

  useEffect(() => {
    if (enabled && !isApiConfigured()) {
      seedDemoRemindersIfEmpty(
        placeholderTasks.map((t) => ({ id: t.id, title: t.title })),
      );
    }
  }, [enabled]);

  const { snooze, dismiss } = useReminderScheduler(enabled, {
    onTrigger: (r) => setActivePopup(r),
  });

  const dismissPopup = useCallback(() => setActivePopup(null), []);

  const snoozeActive = useCallback(
    async (minutes: SnoozeMinutes) => {
      if (!activePopup) return;
      await snooze(activePopup.id, minutes);
      setActivePopup(null);
    },
    [activePopup, snooze],
  );

  const dismissActive = useCallback(async () => {
    if (!activePopup) return;
    await dismiss(activePopup.id);
    setActivePopup(null);
  }, [activePopup, dismiss]);

  const value = useMemo(
    () => ({
      activePopup,
      dismissPopup,
      snoozeActive,
      dismissActive,
      openScheduler,
      setOpenScheduler,
    }),
    [activePopup, dismissPopup, snoozeActive, dismissActive, openScheduler],
  );

  return (
    <ReminderContext.Provider value={value}>
      {children}
      {enabled && (
        <>
          <BrowserNotificationPrompt />
          {activePopup && typeof activePopup.taskId === "object" && activePopup.taskId?.fullscreenAlertEnabled ? (
            <FullScreenAlert
              reminder={activePopup}
              onSnooze={snoozeActive}
              onDismiss={dismissActive}
            />
          ) : (
            <ReminderPopup
              reminder={activePopup}
              onSnooze={snoozeActive}
              onDismiss={dismissActive}
              onClose={dismissPopup}
            />
          )}
          <ReminderScheduler open={openScheduler} onOpenChange={setOpenScheduler} />
        </>
      )}
    </ReminderContext.Provider>
  );
}

export function useReminderContext() {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error("useReminderContext must be used within ReminderProvider");
  return ctx;
}
