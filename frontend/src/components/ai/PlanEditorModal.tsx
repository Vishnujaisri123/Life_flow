import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GripVertical, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AiScheduleBlock } from "@/types/ai";
import { useTasks } from "@/hooks/useTasks";
import { format, parse } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  blocks: AiScheduleBlock[];
  onSave: (blocks: AiScheduleBlock[]) => void;
};

export function PlanEditorModal({ isOpen, onClose, blocks: initialBlocks, onSave }: Props) {
  const [blocks, setBlocks] = useState<AiScheduleBlock[]>([]);
  const { tasks } = useTasks();
  const [warnings, setWarnings] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen) {
      setBlocks([...initialBlocks]);
    }
  }, [isOpen, initialBlocks]);

  useEffect(() => {
    // Overlap validation
    const newWarnings: Record<number, string> = {};
    const today = new Date();
    const dateStr = format(today, "yyyy-MM-dd");

    blocks.forEach((block, idx) => {
      try {
        const blockTime = parse(block.time, "HH:mm", today);
        if (Number.isNaN(blockTime.getTime())) return;
        
        // simple overlap check with existing tasks for today
        const overlap = tasks.find(t => {
          if (!t.startTime || !t.endTime) return false;
          const tStart = new Date(t.startTime);
          const tEnd = new Date(t.endTime);
          // if task is today
          if (format(tStart, "yyyy-MM-dd") === dateStr) {
            // roughly check if blockTime falls inside task time
            return blockTime >= tStart && blockTime < tEnd;
          }
          return false;
        });

        if (overlap) {
          newWarnings[idx] = `Overlaps with: ${overlap.title}`;
        }
      } catch (e) {
        // ignore parse errors
      }
    });
    setWarnings(newWarnings);
  }, [blocks, tasks]);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("idx", index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData("idx"), 10);
    if (dragIndex === dropIndex) return;
    const newBlocks = [...blocks];
    const [dragged] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(dropIndex, 0, dragged);
    setBlocks(newBlocks);
  };

  const updateBlock = (idx: number, field: keyof AiScheduleBlock, val: string) => {
    const newBlocks = [...blocks];
    newBlocks[idx] = { ...newBlocks[idx], [field]: val };
    setBlocks(newBlocks);
  };

  const removeBlock = (idx: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(idx, 1);
    setBlocks(newBlocks);
  };

  const addBlock = () => {
    setBlocks([...blocks, { time: "12:00", activity: "New Activity", notes: "" }]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground">Edit Plan</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {blocks.map((block, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, idx)}
                className="flex items-start gap-2 bg-muted/20 p-2 rounded-lg border border-border/30 hover:border-primary/50 transition-colors group"
              >
                <div className="mt-2 cursor-grab text-muted-foreground hover:text-primary">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1 grid gap-2 sm:grid-cols-4">
                  <Input 
                    value={block.time} 
                    onChange={(e) => updateBlock(idx, "time", e.target.value)} 
                    placeholder="HH:mm" 
                    className="sm:col-span-1 h-8 text-xs font-mono" 
                  />
                  <Input 
                    value={block.activity} 
                    onChange={(e) => updateBlock(idx, "activity", e.target.value)} 
                    placeholder="Activity" 
                    className="sm:col-span-3 h-8 text-xs" 
                  />
                  {warnings[idx] && (
                    <div className="sm:col-span-4 text-[10px] text-red-400">
                      ⚠️ {warnings[idx]}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeBlock(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full gap-2 mt-4" onClick={addBlock}>
              <Plus className="h-4 w-4" /> Add block
            </Button>
          </div>

          <div className="p-4 border-t border-border/50 flex justify-end gap-2 bg-muted/5">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave(blocks)}>Save Changes</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
