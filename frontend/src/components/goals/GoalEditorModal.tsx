import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, X } from "lucide-react";
import type { Goal, GoalInput, Milestone } from "@/services/goalApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: GoalInput) => Promise<void>;
  initialData?: Goal | null;
  isSaving: boolean;
}

export function GoalEditorModal({ isOpen, onClose, onSave, initialData, isSaving }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalInput['category']>("personal");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<GoalInput['priority']>("medium");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setCategory(initialData.category);
      setTargetDate(new Date(initialData.targetDate).toISOString().split('T')[0]);
      setPriority(initialData.priority);
      setMilestones(initialData.milestones || []);
    } else {
      setTitle("");
      setDescription("");
      setCategory("personal");
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setTargetDate(nextMonth.toISOString().split('T')[0]);
      setPriority("medium");
      setMilestones([]);
    }
  }, [initialData, isOpen]);

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([...milestones, { title: newMilestone.trim(), isCompleted: false }]);
      setNewMilestone("");
    }
  };

  const toggleMilestone = (index: number) => {
    const updated = [...milestones];
    updated[index].isCompleted = !updated[index].isCompleted;
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim() || !targetDate) return;
    await onSave({
      title,
      description,
      category,
      targetDate: new Date(targetDate).toISOString(),
      priority,
      milestones,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 text-foreground sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            {initialData ? "Edit Goal" : "Create Goal"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Goal Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Learn Data Structures" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Date</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why is this important?" className="resize-none" />
          </div>

          <div className="space-y-2">
            <Label>Milestones</Label>
            <div className="flex gap-2">
              <Input 
                value={newMilestone} 
                onChange={(e) => setNewMilestone(e.target.value)} 
                placeholder="Add a milestone step" 
                onKeyDown={(e) => e.key === "Enter" && handleAddMilestone()}
              />
              <Button type="button" variant="secondary" onClick={handleAddMilestone}><Plus className="h-4 w-4" /></Button>
            </div>
            {milestones.length > 0 && (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/20 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={m.isCompleted} 
                        onChange={() => toggleMilestone(i)} 
                        className="rounded border-primary/50 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className={`text-sm ${m.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{m.title}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10" onClick={() => removeMilestone(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}><X className="h-4 w-4 mr-2" /> Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || !title || !targetDate}>
            <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
