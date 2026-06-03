import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrowserNotifications } from "@/hooks/useBrowserNotifications";
import { cn } from "@/lib/utils";

export function BrowserNotificationPrompt() {
  const { shouldShowPrompt, requestPermission, dismissPrompt } = useBrowserNotifications();

  if (!shouldShowPrompt) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md rounded-xl border border-primary/30",
        "glass p-4 shadow-[var(--shadow-glow-cyan)] md:left-auto md:right-6",
      )}
      role="dialog"
      aria-label="Enable notifications"
    >
      <div className="flex gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium">Enable browser notifications?</p>
          <p className="text-xs text-muted-foreground">
            Get alerts when reminders fire, even when LifeFlow is in the background.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void requestPermission()}>
              Allow
            </Button>
            <Button size="sm" variant="ghost" onClick={dismissPrompt}>
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
