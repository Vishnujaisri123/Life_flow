import { Bell } from "lucide-react";
import { PageShell } from "@/components/page/PageShell";
import { LoadingSkeleton } from "@/components/page/LoadingSkeleton";
import { EmptyState } from "@/components/page/EmptyState";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useReminderInbox } from "@/hooks/useReminders";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { isApiConfigured } from "@/services/api";

export function NotificationsPage() {
  const apiEnabled = isApiConfigured();
  const simulatedLoading = useSimulatedLoading();
  const { reminders, history, isLoading: apiLoading, isDemo, unreadCount } = useReminderInbox();

  const isLoading = apiEnabled ? apiLoading : simulatedLoading;
  const isEmpty = reminders.length === 0 && history.length === 0;

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <PageShell
      title="Notifications"
      description={
        isDemo
          ? "Smart reminders with sounds, snooze, and browser alerts — demo mode."
          : "Task reminders, history, and push when Firebase is configured."
      }
    >
      {isEmpty && !apiEnabled ? (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="Schedule a demo reminder from the button below."
        />
      ) : null}
      <NotificationCenter />
      {unreadCount > 0 && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
        </p>
      )}
    </PageShell>
  );
}
