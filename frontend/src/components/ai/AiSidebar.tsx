import React, { useState } from "react";
import { Bot, ListTodo, Trash2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AiChatMode, AiTaskContext } from "@/types/ai";
import { cn } from "@/lib/utils";
import { SavedPlansDrawer } from "./SavedPlansDrawer";

const MODES: { id: AiChatMode; label: string }[] = [
  { id: "general", label: "General" },
  { id: "plan", label: "Plan day" },
  { id: "review", label: "Review" },
  { id: "motivate", label: "Motivate" },
  { id: "schedule", label: "Schedule" },
];

type Props = {
  taskContext: AiTaskContext;
  mode: AiChatMode;
  onModeChange: (mode: AiChatMode) => void;
  onClear: () => void;
  className?: string;
};

export function AiSidebar({
  taskContext,
  mode,
  onModeChange,
  onClear,
  className,
}: Props) {
  const [isPlansDrawerOpen, setIsPlansDrawerOpen] = useState(false);

  return (
    <>
      <aside
        className={cn(
          "flex w-full flex-col gap-4 rounded-2xl border border-border/50 glass p-4 lg:w-64 lg:shrink-0",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">LifeFlow AI</p>
            <p className="text-[11px] text-muted-foreground">
              Live Connection
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ListTodo className="h-3.5 w-3.5" />
            Task snapshot
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              Today {taskContext.todayCount}
            </Badge>
            <Badge
              variant={taskContext.overdueCount > 0 ? "destructive" : "secondary"}
              className="text-[10px]"
            >
              Overdue {taskContext.overdueCount}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              Open {taskContext.openCount}
            </Badge>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Mode
          </p>
          <div className="flex flex-wrap gap-1 lg:flex-col">
            {MODES.map((m) => (
              <Button
                key={m.id}
                type="button"
                size="sm"
                variant={mode === m.id ? "default" : "ghost"}
                className="h-8 justify-start text-xs lg:w-full"
                onClick={() => onModeChange(m.id)}
              >
                {m.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs"
            onClick={() => setIsPlansDrawerOpen(true)}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Saved Plans
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-xs text-muted-foreground"
            onClick={onClear}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear chat
          </Button>
        </div>
      </aside>

      <SavedPlansDrawer
        isOpen={isPlansDrawerOpen}
        onClose={() => setIsPlansDrawerOpen(false)}
      />
    </>
  );
}
