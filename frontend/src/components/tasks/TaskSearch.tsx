import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type TaskSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TaskSearch({ value, onChange }: TaskSearchProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search tasks…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glass pl-9"
        aria-label="Search tasks"
      />
    </div>
  );
}
