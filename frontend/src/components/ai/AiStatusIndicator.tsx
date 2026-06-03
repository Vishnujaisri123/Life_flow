import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Activity, Bot, Zap } from "lucide-react";

type Props = {
  provider: string | null;
  responseTime: number | null;
  isTyping?: boolean;
};

export function AiStatusIndicator({ provider, responseTime, isTyping }: Props) {
  // If no provider is known yet, but it's typing, we show 'Connecting...'
  if (isTyping && !provider) {
    return (
      <Badge variant="outline" className="gap-1.5 text-[10px] animate-pulse border-primary/50 text-primary">
        <Activity className="h-3 w-3" />
        Connecting...
      </Badge>
    );
  }

  // If no provider and not typing, just show default 'Live' state
  if (!provider) {
    return (
      <Badge variant="outline" className="gap-1.5 text-[10px] border-primary/30">
        <Bot className="h-3 w-3 text-primary/70" />
        AI Ready
      </Badge>
    );
  }

  // Capitalize provider name (e.g. openrouter -> OpenRouter)
  const nameMap: Record<string, string> = {
    openrouter: "OpenRouter",
    grok: "Grok",
    gemini: "Gemini",
    openai: "OpenAI",
  };
  const displayName = nameMap[provider.toLowerCase()] || provider;

  return (
    <div className="flex items-center gap-2">
      {responseTime && (
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-500" />
          {responseTime}ms
        </span>
      )}
      <Badge 
        variant="outline" 
        className={cn(
          "gap-1.5 text-[10px] transition-all",
          isTyping 
            ? "border-primary text-primary shadow-[0_0_8px_rgba(var(--primary),0.3)] animate-pulse" 
            : "border-primary/50 text-foreground"
        )}
      >
        <span className="relative flex h-2 w-2">
          {isTyping && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        {displayName}
      </Badge>
    </div>
  );
}
