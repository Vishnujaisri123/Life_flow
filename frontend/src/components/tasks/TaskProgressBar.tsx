import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

type TaskProgressBarProps = {
  percent: number;
  total: number;
};

export function TaskProgressBar({ percent, total }: TaskProgressBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl border border-border/60 p-4 space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Completion progress</span>
        <span className="text-primary font-semibold tabular-nums">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {total === 0
          ? "No tasks in current view"
          : `${percent}% of ${total} visible task${total === 1 ? "" : "s"} complete`}
      </p>
    </motion.div>
  );
}
