import { apiDelete, apiGet, apiPost } from "@/services/apiClient";
import type { AiChatMode, AiChatRequest, AiChatResponse, AiMessage } from "@/types/ai";

export async function postAiChat(body: AiChatRequest): Promise<AiChatResponse> {
  return apiPost<AiChatResponse>("/ai/chat", body);
}

export async function confirmAiAction(action: any): Promise<any> {
  return apiPost<any>("/ai/action/confirm", { action });
}

export async function fetchAiHistory(): Promise<{ messages: AiMessage[] }> {
  const data = await apiGet<{
    messages: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      mode?: string;
      createdAt: string;
    }>;
  }>("/ai/history");
  return {
    messages: data.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      mode: m.mode as AiChatMode | undefined,
      createdAt: new Date(m.createdAt).getTime(),
    })),
  };
}

export async function clearAiHistory(): Promise<void> {
  await apiDelete<{ cleared: boolean }>("/ai/history");
}
