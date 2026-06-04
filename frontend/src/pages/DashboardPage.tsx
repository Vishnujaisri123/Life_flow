import { useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { PageShell } from "@/components/page/PageShell";
import { LoadingSkeleton } from "@/components/page/LoadingSkeleton";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GamificationWidget } from "@/components/GamificationWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTasks, useTaskFilters, useTaskMutations } from "@/hooks/useTasks";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { isApiConfigured } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { ActiveTaskWidget, MissedTasksWidget, TodaysScheduleWidget, DashboardRemindersWidget, NextTaskWidget } from "@/components/dashboard/TaskWidgets";
import { ROUTES } from "@/routes/paths";
import { useQueryClient } from "@tanstack/react-query";

export function DashboardPage() {
  const { user } = useAuth();
  const apiEnabled = isApiConfigured();
  const simulatedLoading = useSimulatedLoading();
  const queryClient = useQueryClient();
  const { tasks, isLoading: tasksLoading, isDemo } = useTasks();
  const { stats, data, isLoading: analyticsLoading } = useAnalytics();
  const { syncGoogleCalendar } = useTaskMutations();

  const { sections } = useTaskFilters(tasks);

  const triggerGoogleSync = useCallback(() => {
    syncGoogleCalendar(undefined, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["reminders"] });
      },
    });
  }, [syncGoogleCalendar, queryClient]);

  useEffect(() => {
    if (!isDemo && user?.googleRefreshToken) {
      triggerGoogleSync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.googleRefreshToken]);

  const isLoading = apiEnabled
    ? analyticsLoading || tasksLoading
    : simulatedLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const openTasks = sections.today.filter((t) => t.status !== "done").slice(0, 3);

  const focusScore = data?.productivityScore ?? 94;

  return (
    <PageShell
      title="Dashboard"
      description={
        isDemo
          ? "Your AI-orchestrated day at a glance — placeholder data until API connects."
          : "Live stats from your LifeFlow account."
      }
      actions={
        <Button size="sm" asChild>
          <Link to={ROUTES.aiAssistant}>
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s focus</CardTitle>
            <Flame className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-4xl font-bold text-gradient">{focusScore}%</span>
              <span className="text-sm text-muted-foreground">Productivity score</span>
            </div>
            <Progress value={focusScore} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {isDemo
                ? "LifeFlow AI optimized your morning for high-focus tasks. Connect a calendar to sync live."
                : `${data?.tasksDoneToday ?? 0} tasks completed today · ${data?.tasksOpen ?? 0} still open.`}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ActiveTaskWidget tasks={sections.today} />
          <NextTaskWidget tasks={sections.upcoming.concat(sections.today)} />
          <DashboardRemindersWidget />
          <MissedTasksWidget missed={sections.missed} />

          <Card className="glass border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Up next</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.tasks}>
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {openTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open tasks for today.</p>
              ) : (
                openTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{task.title}</span>
                    <span className="text-xs text-muted-foreground">{task.due ?? "—"}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <TodaysScheduleWidget today={sections.today} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <PomodoroTimer />
        <GamificationWidget />
      </div>
    </PageShell>
  );
}
