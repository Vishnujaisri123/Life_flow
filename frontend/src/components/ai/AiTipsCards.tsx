import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  tips: string[];
};

export function AiTipsCards({ tips }: Props) {
  return (
    <div className="grid w-full gap-2 sm:grid-cols-2">
      {tips.map((tip, i) => (
        <motion.div
          key={`${i}-${tip.slice(0, 24)}`}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs"
        >
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{tip}</span>
        </motion.div>
      ))}
    </div>
  );
}
