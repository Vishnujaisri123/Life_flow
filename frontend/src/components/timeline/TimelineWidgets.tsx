import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, CircleDashed, Clock, Target, Zap } from "lucide-react";
import { isToday } from "date-fns";
import type { TaskItem } from "@/services/placeholders";

export function TimelineStatistics({ tasks }: { tasks: TaskItem[] }) {
  const stats = useMemo(() => {
    const todayTasks = tasks.filter((t) => {
      const d = new Date(t.startTime || t.dueDate || new Date());
      return isToday(d) && !t.completed;
    });
    
    const completedTasks = tasks.filter((t) => {
      const d = new Date(t.startTime || t.dueDate || new Date());
      return isToday(d) && t.completed;
    });

    const totalTasks = todayTasks.length + completedTasks.length;

    // Calculate missed tasks (due in the past, not completed)
    const missedTasks = todayTasks.filter((t) => {
      const end = t.endTime || t.dueDate;
      if (!end) return false;
      return new Date(end) < new Date();
    }).length;

    // Calculate Focus Hours (sum of duration of completed tasks, or just roughly based on 1hr per task if no duration)
    let focusMinutes = 0;
    completedTasks.forEach((t) => {
      if (t.duration) {
        focusMinutes += t.duration;
      } else if (t.startTime && t.endTime) {
        const diff = new Date(t.endTime).getTime() - new Date(t.startTime).getTime();
        focusMinutes += diff / (1000 * 60);
      } else {
        focusMinutes += 30; // default 30 mins
      }
    });

    const productivityScore = totalTasks === 0 ? 0 : Math.round((completedTasks.length / totalTasks) * 100);

    return {
      total: totalTasks,
      completed: completedTasks.length,
      missed: missedTasks,
      focusHours: (focusMinutes / 60).toFixed(1),
      score: productivityScore,
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <Card className="glass border-border/60">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <CircleDashed className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Tasks</p>
        </CardContent>
      </Card>
      
      <Card className="glass border-border/60">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold">{stats.completed}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
        </CardContent>
      </Card>

      <Card className="glass border-border/60">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <Clock className="h-5 w-5 text-red-500 mb-2" />
          <p className="text-2xl font-bold">{stats.missed}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Missed</p>
        </CardContent>
      </Card>

      <Card className="glass border-border/60">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <Target className="h-5 w-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{stats.focusHours}h</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Focus Hours</p>
        </CardContent>
      </Card>

      <Card className="glass border-border/60 col-span-2 md:col-span-1">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <Zap className="h-5 w-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{stats.score}%</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Productivity</p>
        </CardContent>
      </Card>
    </div>
  );
}
