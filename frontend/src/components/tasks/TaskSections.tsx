import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CalendarDays, AlertTriangle, LayoutList } from "lucide-react";

type TaskSectionsProps = {
  active: "all" | "today" | "upcoming" | "missed";
  onChange: (section: "all" | "today" | "upcoming" | "missed") => void;
  counts: {
    all: number;
    today: number;
    upcoming: number;
    missed: number;
  };
};

export function TaskSections({ active, onChange, counts }: TaskSectionsProps) {
  return (
    <Tabs
      value={active}
      onValueChange={(v) => onChange(v as TaskSectionsProps["active"])}
      className="w-full"
    >
      <TabsList className="glass h-auto w-full flex flex-wrap gap-1 p-1">
        <TabsTrigger value="all" className="flex-1 min-w-[5rem] gap-1.5 text-xs sm:text-sm">
          <LayoutList className="h-3.5 w-3.5 shrink-0" />
          All
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {counts.all}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="today" className="flex-1 min-w-[5rem] gap-1.5 text-xs sm:text-sm">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          Today
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {counts.today}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="upcoming" className="flex-1 min-w-[5rem] gap-1.5 text-xs sm:text-sm">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          Upcoming
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {counts.upcoming}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="missed" className="flex-1 min-w-[5rem] gap-1.5 text-xs sm:text-sm">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
          Missed
          <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
            {counts.missed}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
