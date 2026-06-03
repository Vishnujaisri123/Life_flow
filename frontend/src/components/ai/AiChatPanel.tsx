import { Bot } from "lucide-react";
import { useAiChat } from "@/hooks/useAiChat";
import { AiMessageList } from "@/components/ai/AiMessageList";
import { AiInputBar } from "@/components/ai/AiInputBar";
import { AiSuggestedPrompts } from "@/components/ai/AiSuggestedPrompts";
import { AiSidebar } from "@/components/ai/AiSidebar";
import { AiStatusIndicator } from "@/components/ai/AiStatusIndicator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  /** Hide left sidebar (e.g. drawer already narrow) */
  hideSidebar?: boolean;
  /** Show sidebar above chat on small screens (full AI page) */
  showMobileSidebar?: boolean;
  className?: string;
};

export function AiChatPanel({ hideSidebar, showMobileSidebar, className }: Props) {
  const {
    messages,
    isTyping,
    mode,
    setMode,
    sendMessage,
    clearChat,
    taskContext,
    lastProvider,
    lastResponseTime,
    confirmAction,
  } = useAiChat();

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-4 lg:flex-row",
        className,
      )}
    >
      {showMobileSidebar && (
        <AiSidebar
          taskContext={taskContext}
          mode={mode}
          onModeChange={setMode}
          onClear={clearChat}
          className="md:hidden"
        />
      )}
      {!hideSidebar && (
        <AiSidebar
          taskContext={taskContext}
          mode={mode}
          onModeChange={setMode}
          onClear={clearChat}
          className="hidden md:flex"
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border/60 glass">
        <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 md:px-4">
          <span className="text-xs text-muted-foreground">Chat</span>
          <AiStatusIndicator 
            provider={lastProvider} 
            responseTime={lastResponseTime} 
            isTyping={isTyping} 
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-3 md:p-4 min-h-0">
          <AiSuggestedPrompts
            compact
            disabled={isTyping}
            onSelect={(prompt, m) => void sendMessage(prompt, m ?? mode)}
          />
          <div className="flex min-h-[280px] flex-1 flex-col min-h-0 md:min-h-[360px]">
            <AiMessageList messages={messages} isTyping={isTyping} onConfirmAction={confirmAction} />
          </div>
          <AiInputBar onSend={(text) => void sendMessage(text)} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
}
