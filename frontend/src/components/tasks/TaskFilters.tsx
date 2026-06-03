import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  PREDEFINED_CATEGORIES,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/components/tasks/constants";
import type { TaskFiltersState } from "@/components/tasks/types";
import { formatCategoryLabel } from "@/components/tasks/constants";

type TaskFiltersProps = {
  filters: TaskFiltersState;
  categories: string[];
  onChange: <K extends keyof TaskFiltersState>(key: K, value: TaskFiltersState[K]) => void;
  onReset: () => void;
};

export function TaskFilters({ filters, categories, onChange, onReset }: TaskFiltersProps) {
  const customCats = categories.filter(
    (c) => !PREDEFINED_CATEGORIES.some((p) => p.value === c),
  );

  return (
    <div className="glass rounded-xl border border-border/60 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4 text-primary" />
          Filters
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-8 gap-1">
          <X className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(v) => onChange("status", v as TaskFiltersState["status"])}
          >
            <SelectTrigger className="glass h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Priority</Label>
          <Select
            value={filters.priority}
            onValueChange={(v) => onChange("priority", v as TaskFiltersState["priority"])}
          >
            <SelectTrigger className="glass h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={filters.category} onValueChange={(v) => onChange("category", v)}>
            <SelectTrigger className="glass h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {PREDEFINED_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
              {customCats.map((c) => (
                <SelectItem key={c} value={c}>
                  {formatCategoryLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <Label className="text-xs text-muted-foreground">Date range</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange("dateFrom", e.target.value)}
              className="glass h-9"
              aria-label="From date"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange("dateTo", e.target.value)}
              className="glass h-9"
              aria-label="To date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
