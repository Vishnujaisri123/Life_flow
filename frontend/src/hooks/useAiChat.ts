import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { isApiConfigured } from "@/services/api";
import { ApiError } from "@/services/apiClient";
import { clearAiHistory, fetchAiHistory, postAiChat } from "@/services/aiApi";
import { placeholderTasks } from "@/services/placeholders";
import { fetchTasks, mapApiTaskToItem } from "@/services/taskApi";
import type { AiChatMode, AiMessage, AiTaskContext } from "@/types/ai";
import { buildTaskContextFromItems } from "@/utils/taskContext";

const STORAGE_PREFIX = "lifeflow-ai-chat";

function storageKey(userId: string | null) {
  return `${STORAGE_PREFIX}:${userId ?? "guest"}`;
}

function loadLocalMessages(key: string): AiMessage[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AiMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalMessages(key: string, messages: AiMessage[]) {
  try {
    localStorage.setItem(key, JSON.stringify(messages.slice(-80)));
  } catch {
    /* quota */
  }
}

const WELCOME: AiMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I'm your LifeFlow assistant. I know your tasks and can help plan your day, review priorities, motivate you, or draft a schedule.",
  createdAt: Date.now(),
};

function newId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useAiChat() {
  const { user } = useAuth();
  const key = storageKey(user?.id ?? null);
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<AiMessage[]>(() => {
    const stored = loadLocalMessages(storageKey(null));
    return stored.length ? stored : [WELCOME];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<AiChatMode>("general");
  const [lastProvider, setLastProvider] = useState<string | null>(null);
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);
  const hydrated = useRef(false);

  const tasksQuery = useQuery({
    queryKey: ["ai-task-context"],
    queryFn: async () => {
      const rows = await fetchTasks();
      return rows.map(mapApiTaskToItem);
    },
    staleTime: 60_000,
  });

  const taskContext: AiTaskContext = useMemo(
    () => buildTaskContextFromItems(tasksQuery.data ?? placeholderTasks),
    [tasksQuery.data],
  );

  const historyQuery = useQuery({
    queryKey: ["ai-history", user?.id],
    queryFn: fetchAiHistory,
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!hydrated.current) {
      const local = loadLocalMessages(key);
      if (local.length) setMessages(local);
      hydrated.current = true;
    }
  }, [key]);

  useEffect(() => {
    if (!historyQuery.data?.messages.length) return;
    if (historyQuery.data.messages.length >= 1) {
      setMessages(historyQuery.data.messages);
    }
  }, [historyQuery.data]);

  useEffect(() => {
    saveLocalMessages(key, messages);
  }, [key, messages]);

  const sendMessage = useCallback(
    async (text: string, overrideMode?: AiChatMode) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const activeMode = overrideMode ?? mode;
      const userMsg: AiMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
        mode: activeMode,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const history = [...messages, userMsg]
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await postAiChat({
          messages: history,
          mode: activeMode,
        });
        
        setLastProvider(res.provider || null);
        setLastResponseTime(res.responseTime || null);

        const assistantMsg: AiMessage = {
          id: newId(),
          role: "assistant",
          content: res.reply,
          createdAt: Date.now(),
          mode: activeMode,
          actionCards: res.actionCards,
          pendingConfirmations: res.pendingConfirmations,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Could not reach the AI service.";
        toast.error(message);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, mode, messages],
  );

  const confirmAction = useCallback(async (action: any, msgId: string) => {
    try {
      const res = await import("@/services/aiApi").then(m => m.confirmAiAction(action));
      toast.success("Action confirmed and executed");
      // Invalidate tasks + reminders so UI reflects the change
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["reminders"] });
      void queryClient.invalidateQueries({ queryKey: ["analytics"] });
      void queryClient.invalidateQueries({ queryKey: ["ai-task-context"] });
      setMessages((prev) => prev.map(m => {
        if (m.id === msgId) {
          const outcome = res.outcome;
          const newPending = m.pendingConfirmations?.filter(p => p !== action);
          const newCards = [...(m.actionCards || []), { type: outcome.type, message: outcome.message, data: outcome.data }];
          return { ...m, pendingConfirmations: newPending, actionCards: newCards };
        }
        return m;
      }));
    } catch {
      toast.error("Failed to execute action");
    }
  }, [queryClient]);

  const clearChat = useCallback(async () => {
    setMessages([{ ...WELCOME, createdAt: Date.now() }]);
    saveLocalMessages(key, []);
    try {
      await clearAiHistory();
    } catch {
      toast.error("Could not clear server history");
    }
  }, [key]);

  return {
    messages,
    isTyping,
    isDemoMode: false,
    mode,
    setMode,
    sendMessage,
    clearChat,
    confirmAction,
    taskContext,
    tasksLoading: tasksQuery.isLoading,
    historyLoading: historyQuery.isLoading,
    lastProvider,
    lastResponseTime,
  };
}
