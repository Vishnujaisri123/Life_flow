import React, { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Trash2, CalendarClock } from "lucide-react";
import { fetchPlans, deletePlan, type SavedPlan } from "@/services/planClient";
import { toast } from "sonner";
import { AiScheduleCard } from "./AiScheduleCard";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function SavedPlansDrawer({ isOpen, onClose }: Props) {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
      setSelectedPlan(null);
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await fetchPlans();
      setPlans(data);
    } catch (e) {
      toast.error("Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlan(id);
      setPlans(plans.filter(p => p._id !== id));
      if (selectedPlan?._id === id) setSelectedPlan(null);
      toast.success("Plan deleted");
    } catch (e) {
      toast.error("Failed to delete plan");
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50 flex items-center justify-between">
          <DrawerTitle>Saved Plans</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto flex flex-col md:flex-row gap-4 h-full">
          {/* Plan List */}
          <div className="w-full md:w-1/3 flex flex-col gap-2 border-r border-border/50 pr-4">
            {isLoading ? (
              <div className="text-sm text-muted-foreground animate-pulse">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="text-sm text-muted-foreground">No saved plans found.</div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan._id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedPlan?._id === plan._id ? "border-primary bg-primary/5" : "border-border/30 hover:bg-muted/10"
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{plan.title}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(plan._id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
          
          {/* Plan Detail */}
          <div className="w-full md:w-2/3">
            {selectedPlan ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">{selectedPlan.title}</h3>
                <AiScheduleCard schedule={{ blocks: selectedPlan.planData.blocks }} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Select a plan to view and apply
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
