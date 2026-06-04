import React, { useState, useEffect, useMemo } from "react";
import { format, addMinutes, differenceInMinutes, isBefore, isAfter } from "date-fns";
import { Clock, Play, CheckCircle2, Moon, Edit, Trash, Move, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskItem } from "@/services/placeholders";
import { getISTTimePixels, isTodayIST, setISTWallClock, formatISTTime } from "@/utils/ist";
import { useTaskMutations } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DndContext, useDraggable, useDroppable, DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// Calculate top position based on time (1 min = 1.5px, 1 hour = 90px)
const PIXELS_PER_MINUTE = 1.5;
const HOUR_HEIGHT = 60 * PIXELS_PER_MINUTE; // 90px

function getTimeFromPixels(pixels: number) {
  const minutes = Math.round(pixels / PIXELS_PER_MINUTE);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return { hours, mins };
}

function getPixelsFromDate(date: Date) {
  return getISTTimePixels(date);
}

// -----------------------------------------------------
// Draggable Task Block
// -----------------------------------------------------
function TaskBlock({ task, onQuickAction }: { task: TaskItem; onQuickAction: (id: string, action: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const start = new Date(task.startTime || new Date());
  let durationMins = task.duration;
  if (!durationMins && task.endTime) {
    durationMins = differenceInMinutes(new Date(task.endTime), start);
  }
  if (!durationMins || durationMins <= 0) durationMins = 60; // default 1 hr

  const topPx = getPixelsFromDate(start);
  const heightPx = durationMins * PIXELS_PER_MINUTE;

  const now = new Date();
  const end = addMinutes(start, durationMins);
  
  // "Active Now" detection
  const isActive = isTodayIST(start) && isBefore(start, now) && isAfter(end, now) && !task.completed;

  const style: React.CSSProperties = {
    top: `${topPx}px`,
    height: `${heightPx}px`,
    transform: CSS.Translate.toString(transform),
    zIndex: isActive ? 50 : isDragging ? 100 : 10,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute left-16 right-4 rounded-xl border p-3 shadow-sm transition-all overflow-hidden flex flex-col group",
        "bg-background/80 backdrop-blur-md border-border/50",
        isActive && "border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)] animate-pulse-slow",
        task.completed && "opacity-50 grayscale",
        isDragging && "opacity-80 scale-[1.02] cursor-grabbing"
      )}
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-semibold text-sm truncate pr-2">{task.title}</h4>
        {isActive && (
          <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-none shrink-0 uppercase text-[10px] tracking-widest h-5">
            Active Now
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>
          {formatISTTime(start)} - {formatISTTime(end)} ({durationMins}m)
        </span>
        {task.reminderEnabled && task.reminderBefore != null && task.startTime && (
          <Badge variant="outline" className="h-4 px-1 text-[9px] flex gap-1 items-center bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Bell className="w-2 h-2" /> {formatISTTime(new Date(new Date(task.startTime).getTime() - task.reminderBefore * 60_000).toISOString())}
          </Badge>
        )}
      </div>

      {/* Quick Actions overlay */}
      {!isDragging && (
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-background via-background/90 to-transparent flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!task.completed && (
            <>
              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={(e) => { e.stopPropagation(); onQuickAction(task.id, 'complete'); }}>
                <CheckCircle2 className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full text-primary hover:text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); onQuickAction(task.id, 'start'); }}>
                <Play className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-muted" onClick={(e) => { e.stopPropagation(); onQuickAction(task.id, 'snooze'); }}>
                <Moon className="w-3 h-3" />
              </Button>
            </>
          )}
          <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onQuickAction(task.id, 'delete'); }}>
            <Trash className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------
// Drop Zone Timeline
// -----------------------------------------------------
function TimelineDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: 'timeline-zone' });
  
  return (
    <div ref={setNodeRef} className="relative w-full h-full min-h-[1440px]">
      {children}
    </div>
  );
}

// -----------------------------------------------------
// Main Component
// -----------------------------------------------------
export function DailyTimeline({ tasks }: { tasks: TaskItem[] }) {
  const { updateTask, deleteTask } = useTaskMutations();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update real-time line every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter tasks to today only
  const todaysTasks = useMemo(() => {
    return tasks.filter(t => {
      const d = t.startTime ? new Date(t.startTime) : (t.dueDate ? new Date(t.dueDate) : null);
      return d ? isTodayIST(d) : false;
    });
  }, [tasks]);

  // Conflict Detection
  const conflicts = useMemo(() => {
    let overlapping = 0;
    for (let i = 0; i < todaysTasks.length; i++) {
      for (let j = i + 1; j < todaysTasks.length; j++) {
        const t1 = todaysTasks[i];
        const t2 = todaysTasks[j];
        if (t1.completed || t2.completed) continue;
        
        const s1 = new Date(t1.startTime || new Date());
        const e1 = addMinutes(s1, t1.duration || 60);
        const s2 = new Date(t2.startTime || new Date());
        const e2 = addMinutes(s2, t2.duration || 60);

        if (s1 < e2 && s2 < e1) {
          overlapping++;
        }
      }
    }
    return overlapping;
  }, [todaysTasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!delta.y || delta.y === 0) return;

    const task = active.data.current?.task as TaskItem;
    if (!task) return;

    const start = new Date(task.startTime || new Date());
    const initialPixels = getPixelsFromDate(start);
    const newPixels = initialPixels + delta.y;
    
    let { hours, mins } = getTimeFromPixels(Math.max(0, newPixels));
    
    // Snap to 15 minute intervals
    mins = Math.round(mins / 15) * 15;
    if (mins === 60) {
      hours += 1;
      mins = 0;
    }
    
    const newStartDate = setISTWallClock(start, Math.min(23, hours), mins);

    const dur = task.duration || differenceInMinutes(new Date(task.endTime!), start) || 60;
    const newEndDate = addMinutes(newStartDate, dur);

    updateTask({
      id: task.id,
      body: {
        startTime: newStartDate.toISOString(),
        endTime: newEndDate.toISOString()
      } as any
    });
  };

  const handleQuickAction = (id: string, action: string) => {
    if (action === 'complete') updateTask({ id, body: { completed: true, status: 'done' } as any });
    if (action === 'start') updateTask({ id, body: { status: 'in_progress' } as any });
    if (action === 'snooze') {
      const t = todaysTasks.find(x => x.id === id);
      if (t && t.startTime) {
        const newStart = addMinutes(new Date(t.startTime), 30);
        const dur = t.duration || 60;
        updateTask({ id, body: { startTime: newStart.toISOString(), endTime: addMinutes(newStart, dur).toISOString() } as any});
      }
    }
    if (action === 'delete') deleteTask(id);
  };

  const hoursList = Array.from({ length: 24 }).map((_, i) => i);

  return (
    <div className="flex flex-col h-[calc(100vh-250px)]">
      {/* Warning Banner */}
      {conflicts > 0 && (
        <div className="bg-destructive/10 text-destructive text-sm font-medium px-4 py-2 rounded-lg mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
            Schedule Conflict Detected: {conflicts} overlapping tasks.
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-destructive hover:bg-destructive/20">Auto-Fix with AI</Button>
        </div>
      )}

      {/* Timeline Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
        <DndContext onDragEnd={handleDragEnd}>
          <TimelineDropZone>
            
            {/* Background Hour Lines */}
            {hoursList.map(h => (
              <div key={h} className="absolute w-full flex" style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }}>
                <div className="w-14 shrink-0 text-right pr-3 -mt-2 text-xs font-medium text-muted-foreground/60 select-none">
                  {format(new Date().setHours(h, 0), "h a")}
                </div>
                <div className="flex-1 border-t border-border/40 relative">
                  <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-border/20"></div>
                </div>
              </div>
            ))}

            {/* Tasks */}
            {todaysTasks.map(task => (
              <TaskBlock key={task.id} task={task} onQuickAction={handleQuickAction} />
            ))}

            {/* Real-time Current Time Line */}
            <div 
              className="absolute left-14 right-0 z-50 flex items-center pointer-events-none transition-all duration-1000"
              style={{ top: getPixelsFromDate(currentTime) }}
            >
              <div className="w-2 h-2 rounded-full bg-primary -ml-1 shadow-[0_0_8px_rgba(var(--primary),0.8)]"></div>
              <div className="h-[2px] flex-1 bg-primary/70 shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
              <div className="absolute -left-12 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 rounded uppercase tracking-wider">
                {format(currentTime, "h:mm a")}
              </div>
            </div>

          </TimelineDropZone>
        </DndContext>
      </div>
    </div>
  );
}
