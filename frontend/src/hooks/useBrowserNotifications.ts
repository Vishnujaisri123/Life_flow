import { useCallback, useEffect, useState } from "react";

const PERM_KEY = "lifeflow_notification_permission_dismissed";

export function useBrowserNotifications() {
  const supported = typeof window !== "undefined" && "Notification" in window;
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : "denied",
  );
  const [promptDismissed, setPromptDismissed] = useState(
    () => localStorage.getItem(PERM_KEY) === "1",
  );

  useEffect(() => {
    if (!supported) return;
    setPermission(Notification.permission);
  }, [supported]);

  const requestPermission = useCallback(async () => {
    if (!supported) return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [supported]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!supported || permission !== "granted") return null;
      try {
        return new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });
      } catch {
        return null;
      }
    },
    [supported, permission],
  );

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(PERM_KEY, "1");
    setPromptDismissed(true);
  }, []);

  const shouldShowPrompt =
    supported && permission === "default" && !promptDismissed;

  return {
    supported,
    permission,
    shouldShowPrompt,
    requestPermission,
    showNotification,
    dismissPrompt,
  };
}
