import React, { useState } from "react";
import { PageShell } from "@/components/page/PageShell";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGoals, useGoalMutations } from "@/hooks/useGoals";
import type { Goal, GoalInput } from "@/services/goalApi";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalEditorModal } from "@/components/goals/GoalEditorModal";
import { GoalAnalytics } from "@/components/goals/GoalAnalytics";

export function GoalsPage() {
  const { data: goals, isLoading } = useGoals();
  const { createGoalAsync, updateGoalAsync, deleteGoalAsync, isCreating, isUpdating } = useGoalMutations();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleCreate = () => {
    setEditingGoal(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditorOpen(true);
  };

  const handleSave = async (payload: GoalInput) => {
    if (editingGoal) {
      await updateGoalAsync({ id: editingGoal._id, payload });
    } else {
      await createGoalAsync(payload);
    }
  };

  const handleStatusChange = async (id: string, status: Goal['status']) => {
    await updateGoalAsync({ id, payload: { status } });
  };

  if (isLoading) {
    return (
      <PageShell title="Goals" description="Loading your goals...">
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Goals"
      description="Set long-term objectives, track milestones, and conquer your ambitions."
      actions={
        <Button onClick={handleCreate} className="shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <Plus className="mr-2 h-4 w-4" /> New Goal
        </Button>
      }
    >
      <div className="space-y-6">
        <GoalAnalytics goals={goals || []} />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {goals?.map((goal) => (
            <GoalCard 
              key={goal._id} 
              goal={goal} 
              onEdit={handleEdit} 
              onDelete={deleteGoalAsync}
              onStatusChange={handleStatusChange}
            />
          ))}
          
          {(!goals || goals.length === 0) && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-border/50 rounded-xl glass">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No goals set yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Start your journey by defining your first major objective.</p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Set Your First Goal
              </Button>
            </div>
          )}
        </div>
      </div>

      <GoalEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialData={editingGoal}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />
    </PageShell>
  );
}
