import { Bot } from "lucide-react";
import { PageShell } from "@/components/page/PageShell";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { Badge } from "@/components/ui/badge";

export function AIAssistantPage() {
  return (
    <PageShell
      title="AI Assistant"
      description="Task-aware productivity coach powered by OpenRouter (server-side)."
      actions={
        <Badge variant="outline" className="gap-1">
          <Bot className="h-3 w-3" />
          LifeFlow AI
        </Badge>
      }
    >
      <AiChatPanel showMobileSidebar className="min-h-[min(520px,calc(100vh-12rem))]" />
    </PageShell>
  );
}
