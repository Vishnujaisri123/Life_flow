import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/page/PageShell";
import { LoadingSkeleton } from "@/components/page/LoadingSkeleton";
import { EmptyState } from "@/components/page/EmptyState";
import { Button } from "@/components/ui/button";
import { TaskModal } from "@/components/tasks/TaskModal";
import { DeleteTaskDialog } from "@/components/tasks/DeleteTaskDialog";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskSearch } from "@/components/tasks/TaskSearch";
import { TaskProgressBar } from "@/components/tasks/TaskProgressBar";
import { TaskSections } from "@/components/tasks/TaskSections";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import {
  useTasks,
  useTodayTasks,
  useTaskMutations,
  useTaskFilters,
  applyClientFilters,
} from "@/hooks/useTasks";
import { isApiConfigured } from "@/services/api";
import type { TaskItem } from "@/services/placeholders";
import { placeholderTasks } from "@/services/placeholders";
import type { TaskFormValues } from "@/components/tasks/types";

const sectionEmptyCopy = {
  all: { title: "No tasks yet", description: "Create your first task to get started." },
  today: { title: "Nothing due today", description: "Enjoy the clear schedule or plan ahead." },
  upcoming: { title: "No upcoming tasks", description: "Future-dated tasks will appear here." },
  missed: { title: "No missed tasks", description: "You're caught up on overdue items." },
} as const;

export function TasksPage() {
  const simulatedLoading = useSimulatedLoading();
  const { tasks: apiTasks, isLoading: apiLoading, isDemo } = useTasks();
  const todayQuery = useTodayTasks();
  const {
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    reorderLocal,
    apiEnabled,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTaskMutations();

  const [demoTasks, setDemoTasks] = useState<TaskItem[]>(placeholderTasks);
  const sourceTasks = isDemo ? demoTasks : apiTasks;

  const {
    filters,
    updateFilter,
    resetFilters,
    activeSection,
    setActiveSection,
    filtered,
    displayTasks: filteredDisplay,
    sections,
    progress,
    categories,
  } = useTaskFilters(sourceTasks);

  const displayTasks = useMemo(() => {
    if (activeSection === "today" && !isDemo && todayQuery.data) {
      return applyClientFilters(todayQuery.data, filters);
    }
    return filteredDisplay;
  }, [activeSection, isDemo, todayQuery.data, filteredDisplay, filters]);

  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskItem | null>(null);

  const isLoading = isApiConfigured() ? apiLoading : simulatedLoading;

  const sectionCounts = useMemo(
    () => ({
      all: filtered.length,
      today: sections.today.length,
      upcoming: sections.upcoming.length,
      missed: sections.missed.length,
    }),
    [filtered.length, sections],
  );

  function handleReorder(from: number, to: number) {
    if (isDemo) {
      setDemoTasks((prev) => {
        const next = [...prev];
        const [removed] = next.splice(from, 1);
        next.splice(to, 0, removed);
        return next.map((t, i) => ({ ...t, order: i }));
      });
      return;
    }
    reorderLocal(displayTasks, from, to);
  }

  function handleCreate(values: TaskFormValues) {
    if (!apiEnabled) return;
    createTask(values, {
      onSuccess: () => setAddOpen(false),
    });
  }

  function handleUpdate(values: TaskFormValues) {
    if (!apiEnabled || !editTask) return;
    updateTask(
      { id: editTask.id, body: values },
      { onSuccess: () => setEditTask(null) },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (!apiEnabled) {
      setDeleteTarget(null);
      return;
    }
    deleteTask(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const empty = sectionEmptyCopy[activeSection];

  return (
    <PageShell
      title="Tasks"
      description={
        isDemo
          ? "Advanced task management — demo data until API is connected."
          : "Organize, filter, and complete your LifeFlow tasks."
      }
      actions={
        <Button size="sm" onClick={() => setAddOpen(true)} disabled={!apiEnabled}>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TaskSearch value={filters.search} onChange={(v) => updateFilter("search", v)} />
          <TaskSections
            active={activeSection}
            onChange={setActiveSection}
            counts={sectionCounts}
          />
        </div>

        <TaskProgressBar percent={progress} total={filtered.length} />

        <TaskFilters
          filters={filters}
          categories={categories}
          onChange={updateFilter}
          onReset={resetFilters}
        />

        {sourceTasks.length === 0 && !isDemo ? (
          <EmptyState
            icon={Plus}
            title="No tasks yet"
            description="Create your first task to get started."
            actionLabel={apiEnabled ? "Add task" : undefined}
            onAction={apiEnabled ? () => setAddOpen(true) : undefined}
          />
        ) : (
          <TaskList
            tasks={displayTasks}
            apiEnabled={apiEnabled}
            emptyTitle={empty.title}
            emptyDescription={empty.description}
            onReorder={handleReorder}
            onComplete={(id) => completeTask(id)}
            onEdit={(t) => setEditTask(t)}
            onDelete={(t) => setDeleteTarget(t)}
          />
        )}
      </div>

      <TaskModal
        mode="add"
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />

      <TaskModal
        mode="edit"
        open={!!editTask}
        onOpenChange={(open) => !open && setEditTask(null)}
        task={editTask}
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
      />

      <DeleteTaskDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        taskTitle={deleteTarget?.title}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </PageShell>
  );
}
