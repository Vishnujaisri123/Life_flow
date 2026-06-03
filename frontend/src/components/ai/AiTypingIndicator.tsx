import { motion } from "framer-motion";

export function AiTypingIndicator() {
  return (
    <div
      className="mr-auto flex max-w-[85%] items-center gap-1.5 rounded-2xl glass px-4 py-3"
      role="status"
      aria-label="Assistant is typing"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-primary/80"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground">LifeFlow is thinking…</span>
    </div>
  );
}
