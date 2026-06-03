import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isApiConfigured } from "@/services/api";
import {
  isFirebaseConfigured,
  requestFcmToken,
  subscribeForegroundMessages,
} from "@/services/firebase";
import { registerFcmToken } from "@/services/reminderApi";

export function useFCM(enabled: boolean) {
  const [token, setToken] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const apiEnabled = isApiConfigured();
  const firebaseReady = isFirebaseConfigured();

  useEffect(() => {
    if (!enabled || !firebaseReady || !apiEnabled) return;

    let unsub: (() => void) | null = null;

    (async () => {
      const fcmToken = await requestFcmToken();
      if (!fcmToken) return;
      setToken(fcmToken);
      try {
        await registerFcmToken(fcmToken);
        setRegistered(true);
      } catch {
        toast.error("Could not register push token");
      }
    })();

    unsub = subscribeForegroundMessages((payload) => {
      const data = payload as { notification?: { title?: string; body?: string } };
      const title = data.notification?.title ?? "LifeFlow";
      const body = data.notification?.body ?? "";
      toast.info(title, { description: body });
    });

    return () => {
      unsub?.();
    };
  }, [enabled, firebaseReady, apiEnabled]);

  return {
    firebaseReady,
    token,
    registered,
  };
}
