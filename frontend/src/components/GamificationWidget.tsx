import React from "react";
import { Target, Award, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";

export function GamificationWidget() {
  const { user } = useAuth();
  
  // Default values for missing properties in the user object yet to be added
  const xp = user && 'xp' in user ? (user.xp as number) : 150;
  const level = user && 'level' in user ? (user.level as number) : 1;
  const badges = user && 'badges' in user ? (user.badges as string[]) : ["Early Adopter"];
  
  const xpForNextLevel = level * 1000;
  const progressPercent = (xp / xpForNextLevel) * 100;

  return (
    <Card className="glass border-border/60 shadow-[var(--shadow-card)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Level {level}
          </span>
          <span className="text-xs text-muted-foreground">{xp} / {xpForNextLevel} XP</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progressPercent} className="h-2 mb-4" />
        
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                <Star className="h-3 w-3 fill-primary" />
                {badge}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
