import React from "react";
import { PageShell } from "@/components/page/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Flame } from "lucide-react";

export function HabitsPage() {
  return (
    <PageShell
      title="Habits"
      description="Track your daily routines and build streaks."
    >
      <div className="grid gap-6">
        <Card className="glass border-border/60">
          <CardHeader>
            <CardTitle>Daily Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Morning Meditation</span>
              </div>
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-bold">12 day streak</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium text-muted-foreground line-through">Drink 2L Water</span>
              </div>
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-bold">4 day streak</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
