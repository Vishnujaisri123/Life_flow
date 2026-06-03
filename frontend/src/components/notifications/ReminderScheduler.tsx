import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SoundPicker } from "@/components/notifications/SoundPicker";
import { useReminderMutations } from "@/hooks/useReminders";
import { useTasks } from "@/hooks/useTasks";
import { isApiConfigured } from "@/services/api";
import type { NotificationChannel, ReminderSoundType } from "@/services/reminderApi";
import { createDemoReminder } from "@/services/demoReminders";
import { toast } from "sonner";

type ReminderSchedulerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  defaultTaskId?: string;
};

export function ReminderScheduler({
  open,
  onOpenChange,
  defaultTaskId,
}: ReminderSchedulerProps) {
  const apiEnabled = isApiConfigured();
  const { tasks } = useTasks();
  const { createReminder } = useReminderMutations();
  const [taskId, setTaskId] = useState(defaultTaskId ?? "");
  const [datetime, setDatetime] = useState("");
  const [soundType, setSoundType] = useState<ReminderSoundType>("chime");
  const [notificationType, setNotificationType] = useState<NotificationChannel>("in_app");

  useEffect(() => {
    if (defaultTaskId) setTaskId(defaultTaskId);
  }, [defaultTaskId]);

  useEffect(() => {
    if (!datetime && open) {
      const d = new Date(Date.now() + 15 * 60_000);
      setDatetime(d.toISOString().slice(0, 16));
    }
  }, [open, datetime]);

  const handleSave = () => {
    if (!taskId || !datetime) {
      toast.error("Select a task and time");
      return;
    }
    const body = {
      taskId,
      reminderTime: new Date(datetime).toISOString(),
      soundType,
      notificationType,
    };
    if (apiEnabled) {
      createReminder(body);
    } else {
      createDemoReminder(body);
      toast.success("Demo reminder scheduled");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/60 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule reminder</DialogTitle>
          <DialogDescription>Link a reminder to a task with sound and channel.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Task</Label>
            <Select value={taskId} onValueChange={setTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-datetime">When</Label>
            <Input
              id="reminder-datetime"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Sound</Label>
            <SoundPicker value={soundType} onChange={setSoundType} />
          </div>
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select
              value={notificationType}
              onValueChange={(v) => setNotificationType(v as NotificationChannel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_app">In-app</SelectItem>
                <SelectItem value="browser">Browser</SelectItem>
                <SelectItem value="push">Push (FCM)</SelectItem>
                <SelectItem value="email">Email (planned)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save reminder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ScheduleReminderButton({ taskId }: { taskId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" className="gap-1" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Remind me
      </Button>
      <ReminderScheduler open={open} onOpenChange={setOpen} defaultTaskId={taskId} />
    </>
  );
}
