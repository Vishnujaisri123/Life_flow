import { AnimatePresence } from "framer-motion";
import { TaskCard } from "@/components/tasks/TaskCard";
import { useDragAndDrop } from "@/components/tasks/useDragAndDrop";
import type { TaskItem } from "@/services/placeholders";
import { EmptyState } from "@/components/page/EmptyState";
import { ListTodo } from "lucide-react";

type TaskListProps = {
  tasks: TaskItem[];
  apiEnabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onReorder?: (from: number, to: number) => void;
  onComplete?: (id: string) => void;
  onEdit?: (task: TaskItem) => void;
  onDelete?: (task: TaskItem) => void;
  onView?: (task: TaskItem) => void;
};

export function TaskList({
  tasks,
  apiEnabled = false,
  emptyTitle = "No tasks",
  emptyDescription = "Nothing matches your filters.",
  onReorder,
  onComplete,
  onEdit,
  onDelete,
  onView,
}: TaskListProps) {
  const dnd = useDragAndDrop((from, to) => onReorder?.(from, to));

  if (tasks.length === 0) {
    return <EmptyState icon={ListTodo} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            draggable={!!onReorder}
            apiEnabled={apiEnabled}
            isDragging={dnd.dragIndex === index}
            isOver={dnd.overIndex === index}
            onDragStart={dnd.onDragStart}
            onDragEnd={dnd.onDragEnd}
            onDragOver={dnd.onDragOver}
            onDrop={dnd.onDrop}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveUp={index > 0 ? () => onReorder?.(index, index - 1) : undefined}
            onMoveDown={index < tasks.length - 1 ? () => onReorder?.(index, index + 1) : undefined}
            onClick={onView}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}
