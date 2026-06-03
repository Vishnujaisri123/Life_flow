import React, { useState } from "react";
import { CalendarClock, Plus, Edit2, Save, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { AiScheduleData, AiScheduleBlock } from "@/types/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTaskMutations } from "@/hooks/useTasks";
import { toast } from "sonner";
import { PlanEditorModal } from "./PlanEditorModal";
import { createPlan } from "@/services/planClient";

type Props = {
  schedule: AiScheduleData;
};

export function AiScheduleCard({ schedule }: Props) {
  const [blocks, setBlocks] = useState<AiScheduleBlock[]>(schedule.blocks || []);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { createTaskAsync } = useTaskMutations();

  const handleAddAllToTasks = async () => {
    let added = 0;
    // We get today's date to assign to tasks
    const today = new Date();
    
    for (const block of blocks) {
      try {
        const timeParts = block.time.split(":");
        const taskDate = new Date(today);
        if (timeParts.length >= 2) {
          let hours = parseInt(timeParts[0], 10);
          const minutesMatch = timeParts[1].match(/\d+/);
          const minutes = minutesMatch ? parseInt(minutesMatch[0], 10) : 0;
          
          if (block.time.toLowerCase().includes('pm') && hours < 12) {
            hours += 12;
          } else if (block.time.toLowerCase().includes('am') && hours === 12) {
            hours = 0;
          }
          
          taskDate.setHours(hours, minutes, 0);
        }
        
        await createTaskAsync({
          title: block.activity,
          description: block.notes || "",
          dueDate: taskDate.toISOString(),
          startTime: taskDate.toISOString(),
          category: "work",
          priority: "medium",
          status: "todo",
          reminderEnabled: true,
          reminderBefore: 10,
          soundEnabled: true,
          vibrationEnabled: true,
          fullscreenAlertEnabled: false,
          recurrenceFrequency: "none",
          recurrenceInterval: 1,
          recurrenceEnd: "",
        });
        added++;
      } catch (err) {
        console.error("Failed to add task", err);
      }
    }
    toast.success(`${added} tasks added successfully.`);
  };

  const handleSavePlan = async () => {
    try {
      setIsSaving(true);
      const title = `Plan - ${new Date().toLocaleDateString()}`;
      await createPlan(title, blocks);
      toast.success("Plan saved successfully!");
    } catch (error) {
      toast.error("Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorSave = (newBlocks: AiScheduleBlock[]) => {
    setBlocks(newBlocks);
    setIsEditorOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card className="glass border-primary/25 overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 py-3">
            <CalendarClock className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Suggested schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-3 flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Time</th>
                    <th className="px-4 py-2 font-medium">Activity</th>
                    <th className="px-4 py-2 font-medium hidden sm:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((block, i) => (
                    <tr
                      key={`${block.time}-${i}`}
                      className="border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-4 py-2 font-mono text-primary/90">{block.time}</td>
                      <td className="px-4 py-2">{block.activity}</td>
                      <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">
                        {block.notes ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2 px-4 pt-4 mt-auto">
              <Button size="sm" onClick={handleAddAllToTasks} className="h-8 text-xs font-semibold shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] transition-all">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add All To Tasks
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditorOpen(true)} className="h-8 text-xs">
                <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit Plan
              </Button>
              <Button size="sm" variant="outline" onClick={handleSavePlan} disabled={isSaving} className="h-8 text-xs">
                <Save className="h-3.5 w-3.5 mr-1" /> Save Plan
              </Button>
              <Button size="sm" variant="outline" onClick={handleAddAllToTasks} className="h-8 text-xs">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" /> Add To Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <PlanEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        blocks={blocks}
        onSave={handleEditorSave}
      />
    </>
  );
}
