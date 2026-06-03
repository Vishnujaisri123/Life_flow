import { useEffect, useRef } from "react";
import type { AiMessage } from "@/types/ai";
import { AiMessageBubble } from "@/components/ai/AiMessageBubble";
import { AiTypingIndicator } from "@/components/ai/AiTypingIndicator";

type Props = {
  messages: AiMessage[];
  isTyping: boolean;
  onConfirmAction?: (action: any, msgId: string) => void;
};

export function AiMessageList({ messages, isTyping, onConfirmAction }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-2 min-h-0">
      {messages.map((msg) => (
        <AiMessageBubble key={msg.id} message={msg} onConfirmAction={onConfirmAction} />
      ))}
      {isTyping && <AiTypingIndicator />}
      <div ref={endRef} className="h-1 shrink-0" />
    </div>
  );
}
