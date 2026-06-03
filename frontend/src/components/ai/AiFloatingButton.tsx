import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { ROUTES } from "@/routes/paths";

export function AiFloatingButton() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.div
          className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-[0_0_32px_-4px_hsl(var(--primary)/0.55)]"
            style={{ background: "var(--gradient-primary)" }}
            aria-label="Open AI assistant"
          >
            <Bot className="h-6 w-6" />
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-primary/20 bg-background/95 p-0 sm:max-w-md md:max-w-lg"
      >
        <SheetHeader className="shrink-0 border-b border-border/50 px-4 py-3 text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" />
            AI Assistant
          </SheetTitle>
          <SheetDescription className="text-xs">
            Quick coach — expand for full page
          </SheetDescription>
          <Button variant="ghost" size="sm" className="mt-1 w-fit gap-1 text-xs" asChild>
            <Link to={ROUTES.aiAssistant} onClick={() => setOpen(false)}>
              <Maximize2 className="h-3.5 w-3.5" />
              Open full page
            </Link>
          </Button>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
          <AiChatPanel hideSidebar className="min-h-[70vh]" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
