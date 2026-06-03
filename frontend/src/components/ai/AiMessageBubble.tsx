import { useState } from "react";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import type { AiMessage } from "@/types/ai";
import { parseAssistantContent } from "@/utils/aiParse";
import { AiScheduleCard } from "@/components/ai/AiScheduleCard";
import { AiTipsCards } from "@/components/ai/AiTipsCards";
import { cn } from "@/lib/utils";

type Props = {
  message: AiMessage;
  onConfirmAction?: (action: any, msgId: string) => void;
};

export function AiMessageBubble({ message, onConfirmAction }: Props) {
  const [deniedActions, setDeniedActions] = useState<Set<string>>(new Set());
  const isUser = message.role === "user";
  const parsed = !isUser ? parseAssistantContent(message.content) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex max-w-[92%] flex-col gap-2 md:max-w-[85%]",
        isUser ? "ml-auto items-end" : "mr-auto items-start",
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "text-primary-foreground shadow-[0_0_24px_-8px_hsl(var(--primary)/0.6)]"
            : "glass border border-border/40",
        )}
        style={isUser ? { background: "var(--gradient-primary)" } : undefined}
      >
        <div className="mb-1 flex items-center gap-1.5 opacity-80">
          {isUser ? (
            <User className="h-3.5 w-3.5" />
          ) : (
            <Bot className="h-3.5 w-3.5 text-primary" />
          )}
          <span className="text-[10px] font-medium uppercase tracking-wider">
            {isUser ? "You" : "LifeFlow AI"}
          </span>
        </div>
        <div className="whitespace-pre-wrap">{parsed?.body ?? message.content}</div>
      </div>
      {parsed?.schedule && <AiScheduleCard schedule={parsed.schedule} />}
      {parsed?.tips && parsed.tips.length > 0 && <AiTipsCards tips={parsed.tips} />}
      
      {/* Action Cards (Successful Actions) */}
      {message.actionCards?.map((card, idx) => (
        <div key={idx} className="glass border border-primary/30 rounded-xl p-3 flex items-start gap-3 w-full">
          <div className="rounded-full bg-primary/20 p-2 text-primary mt-0.5">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{card.message}</p>
          </div>
        </div>
      ))}

      {/* Pending Confirmations (Dangerous Actions) */}
      {message.pendingConfirmations?.map((conf, idx) => {
        if (deniedActions.has(conf.action)) return null;
        return (
          <div key={idx} className="glass border border-destructive/50 rounded-xl p-4 flex flex-col gap-3 w-full">
            <div className="flex items-center gap-2 text-destructive">
              <span className="text-sm font-bold uppercase tracking-wider">Requires Confirmation</span>
            </div>
            <p className="text-sm">
              AI wants to perform a destructive action: <strong>{conf.action}</strong>
            </p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => onConfirmAction?.(conf, message.id)}
                className="px-4 py-1.5 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md transition-colors"
              >
                Allow Action
              </button>
              <button
                onClick={() => setDeniedActions((prev) => new Set(prev).add(conf.action))}
                className="px-4 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
              >
                Deny
              </button>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
