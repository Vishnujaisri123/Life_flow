import React, { useState } from "react";
import { PageShell } from "@/components/page/PageShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTasks } from "@/hooks/useTasks";
import { TimelineStatistics } from "@/components/timeline/TimelineWidgets";
import { DailyTimeline } from "@/components/timeline/DailyTimeline";
import { CalendarPage } from "@/pages/CalendarPage";
import { LoadingSkeleton } from "@/components/page/LoadingSkeleton";

export function TimelinePage() {
  const { tasks, isLoading } = useTasks();
  const [activeTab, setActiveTab] = useState("day");

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <PageShell
      title="Daily Timeline"
      description="Visually plan and track your schedule."
    >
      <TimelineStatistics tasks={tasks} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="month">Month View</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="mt-0">
          <DailyTimeline tasks={tasks} />
        </TabsContent>

        <TabsContent value="week" className="mt-0">
          <div className="glass p-8 text-center text-muted-foreground rounded-lg border border-border/60">
            <h3 className="text-lg font-medium text-foreground mb-2">Weekly Schedule View</h3>
            <p>Coming soon. Switch to the Month view to see the full calendar.</p>
          </div>
        </TabsContent>

        <TabsContent value="month" className="mt-0">
          <div className="relative">
            {/* We can re-use CalendarPage components or link to it. */}
            <div className="glass p-8 text-center text-muted-foreground rounded-lg border border-border/60">
               <h3 className="text-lg font-medium text-foreground mb-2">Month View</h3>
               <p>Use the main Calendar page for full Month drag-and-drop scheduling.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
