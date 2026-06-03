import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PREDEFINED_CATEGORIES,
  PRIORITY_OPTIONS,
  RECURRENCE_OPTIONS,
  STATUS_OPTIONS,
} from "@/components/tasks/constants";
import { emptyTaskForm, type TaskFormValues } from "@/components/tasks/types";
import type { TaskItem } from "@/services/placeholders";
import { taskItemToForm } from "@/services/taskApi";

type TaskModalProps = {
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskItem | null;
  onSubmit: (values: TaskFormValues) => void;
  isSubmitting?: boolean;
};

export function TaskModal({
  mode,
  open,
  onOpenChange,
  task,
  onSubmit,
  isSubmitting,
}: TaskModalProps) {
  const [form, setForm] = useState<TaskFormValues>(emptyTaskForm);
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && task) {
      const f = taskItemToForm(task);
      setForm(f);
      const isPredefined = PREDEFINED_CATEGORIES.some((c) => c.value === f.category);
      setCustomCategory(isPredefined ? "" : f.category);
    } else {
      setForm(emptyTaskForm);
      setCustomCategory("");
    }
  }, [open, mode, task]);

  const categoryValue =
    customCategory.trim() ||
    (PREDEFINED_CATEGORIES.some((c) => c.value === form.category) ? form.category : form.category);

  function handleSubmit() {
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      category: customCategory.trim() || form.category,
    });
  }

  const set = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/60 max-h-[90vh] overflow-y-auto w-[calc(100vw-1.5rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "New task" : "Edit task"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title *</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="What needs to get done?"
              className="glass"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Details, links, context…"
              className="glass min-h-[80px]"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={PREDEFINED_CATEGORIES.some((c) => c.value === form.category) ? form.category : "custom"}
                onValueChange={(v) => {
                  if (v === "custom") return;
                  setCustomCategory("");
                  set("category", v);
                }}
              >
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom…</SelectItem>
                </SelectContent>
              </Select>
              {(customCategory || !PREDEFINED_CATEGORIES.some((c) => c.value === categoryValue)) && (
                <Input
                  placeholder="Custom category name"
                  value={customCategory || form.category}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="glass mt-2"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v as TaskFormValues["priority"])}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {mode === "edit" && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as TaskFormValues["status"])}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start">Start</Label>
              <Input
                id="start"
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                className="glass"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due date</Label>
              <Input
                id="due"
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                className="glass"
              />
            </div>
          </div>
          <div className="rounded-lg border border-border/50 p-3 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="reminder" className="cursor-pointer font-medium text-primary">
                Enable reminder
              </Label>
              <Switch
                id="reminder"
                checked={form.reminderEnabled}
                onCheckedChange={(v) => set("reminderEnabled", v)}
              />
            </div>
            {form.reminderEnabled && (
              <div className="grid gap-4 pt-3 border-t border-border/50">
                <div className="space-y-2">
                  <Label>Remind me before</Label>
                  <Select
                    value={String(form.reminderBefore)}
                    onValueChange={(v) => set("reminderBefore", Number(v))}
                  >
                    <SelectTrigger className="glass">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">At task time</SelectItem>
                      <SelectItem value="5">5 minutes before</SelectItem>
                      <SelectItem value="10">10 minutes before</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound" className="cursor-pointer text-sm font-normal">Play sound</Label>
                  <Switch id="sound" checked={form.soundEnabled} onCheckedChange={(v) => set("soundEnabled", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="vib" className="cursor-pointer text-sm font-normal">Vibrate device</Label>
                  <Switch id="vib" checked={form.vibrationEnabled} onCheckedChange={(v) => set("vibrationEnabled", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="fs" className="cursor-pointer text-sm font-normal text-destructive font-semibold">Full-screen alert lock</Label>
                  <Switch id="fs" checked={form.fullscreenAlertEnabled} onCheckedChange={(v) => set("fullscreenAlertEnabled", v)} />
                </div>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
            <p className="text-sm font-medium text-primary">Recurring</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={form.recurrenceFrequency ?? "none"}
                  onValueChange={(v) =>
                    set("recurrenceFrequency", v as TaskFormValues["recurrenceFrequency"])
                  }
                >
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.recurrenceFrequency !== "none" && (
                <>
                  <div className="space-y-2">
                    <Label>Every (interval)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.recurrenceInterval}
                      onChange={(e) => set("recurrenceInterval", Number(e.target.value) || 1)}
                      className="glass"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Recurrence ends</Label>
                    <Input
                      type="date"
                      value={form.recurrenceEnd ? form.recurrenceEnd.slice(0, 10) : ""}
                      onChange={(e) => set("recurrenceEnd", e.target.value)}
                      className="glass"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !form.title.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Saving…" : mode === "add" ? "Create task" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
