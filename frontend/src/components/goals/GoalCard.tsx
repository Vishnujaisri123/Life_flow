import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Calendar, MoreVertical, Edit, Trash, Check, Pause, Play, Archive } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Goal } from "@/services/goalApi";

interface Props {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Goal['status']) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onStatusChange }: Props) {
  const daysRemaining = Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
  
  const statusColors = {
    active: "bg-blue-500/20 text-blue-500",
    completed: "bg-green-500/20 text-green-500",
    paused: "bg-yellow-500/20 text-yellow-500",
    archived: "bg-gray-500/20 text-gray-500",
  };

  return (
    <Card className="glass border-border/60 hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            <span className="line-clamp-1">{goal.title}</span>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Edit className="h-4 w-4 mr-2" /> Edit Goal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {goal.status !== 'completed' && (
                <DropdownMenuItem onClick={() => onStatusChange(goal._id, 'completed')}>
                  <Check className="h-4 w-4 mr-2" /> Mark Completed
                </DropdownMenuItem>
              )}
              {goal.status === 'active' && (
                <DropdownMenuItem onClick={() => onStatusChange(goal._id, 'paused')}>
                  <Pause className="h-4 w-4 mr-2" /> Pause Goal
                </DropdownMenuItem>
              )}
              {goal.status === 'paused' && (
                <DropdownMenuItem onClick={() => onStatusChange(goal._id, 'active')}>
                  <Play className="h-4 w-4 mr-2" /> Resume Goal
                </DropdownMenuItem>
              )}
              {goal.status !== 'archived' && (
                <DropdownMenuItem onClick={() => onStatusChange(goal._id, 'archived')}>
                  <Archive className="h-4 w-4 mr-2" /> Archive Goal
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(goal._id)} className="text-destructive">
                <Trash className="h-4 w-4 mr-2" /> Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className={statusColors[goal.status]}>{goal.status}</Badge>
          <Badge variant="outline">{goal.category}</Badge>
          {goal.priority === 'urgent' && <Badge variant="destructive">Urgent</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {goal.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{goal.description}</p>
        )}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span className="font-medium text-primary">{goal.progressPercentage}%</span>
            </div>
            <Progress value={goal.progressPercentage} className="h-2" />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {goal.milestones?.filter(m => m.isCompleted).length || 0} / {goal.milestones?.length || 0} milestones
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysRemaining} days left
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
