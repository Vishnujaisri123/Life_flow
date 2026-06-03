import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SUGGESTED_PROMPTS } from "@/constants/aiPrompts";
import type { AiChatMode } from "@/types/ai";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (prompt: string, mode?: AiChatMode) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function AiSuggestedPrompts({ onSelect, disabled, compact }: Props) {
  const [open, setOpen] = useState(!compact);

  return (
    <div className="space-y-2">
      {compact && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs text-muted-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Suggestions
          <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
        </Button>
      )}
      <AnimatePresence initial={false}>
        {(open || !compact) && (
          <motion.div
            initial={compact ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={compact ? { height: 0, opacity: 0 } : undefined}
            className="flex flex-wrap gap-2 overflow-hidden"
          >
            {SUGGESTED_PROMPTS.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                className="h-8 rounded-full border-primary/30 bg-primary/5 text-xs hover:bg-primary/15"
                onClick={() => onSelect(p.prompt, p.mode)}
              >
                {p.label}
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
