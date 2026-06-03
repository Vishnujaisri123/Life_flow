import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGoals, createGoal, updateGoal, deleteGoal, GoalInput, Goal } from "../services/goalApi";
import { toast } from "sonner";
import { ApiError } from "../services/apiClient";

export function useGoals(status?: string) {
  return useQuery<Goal[], Error>({
    queryKey: ["goals", status],
    queryFn: () => fetchGoals(status),
  });
}

export function useGoalMutations() {
  const queryClient = useQueryClient();

  const createMut = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal created successfully");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to create goal");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GoalInput }) => updateGoal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal updated successfully");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to update goal");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal deleted successfully");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete goal");
    },
  });

  return {
    createGoalAsync: createMut.mutateAsync,
    updateGoalAsync: updateMut.mutateAsync,
    deleteGoalAsync: deleteMut.mutateAsync,
    isCreating: createMut.isPending,
    isUpdating: updateMut.isPending,
    isDeleting: deleteMut.isPending,
  };
}
