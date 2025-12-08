import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coachingSlotsApi } from "@/shared/lib/api";
import type { CoachingSlot } from "@/shared/data/mockData";

export function useCoachingSlots(courseId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["coaching-slots", courseId];

  const {
    data: slots = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<CoachingSlot[]>({
    queryKey,
    queryFn: () => coachingSlotsApi.getAll(courseId ? { courseId } : undefined),
  });

  const createMutation = useMutation({
    mutationFn: coachingSlotsApi.create,
    onSuccess: (newSlot) => {
      queryClient.setQueryData<CoachingSlot[]>(queryKey, (old = []) => [
        ...old,
        newSlot,
      ]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof coachingSlotsApi.update>[1];
    }) => coachingSlotsApi.update(id, data),
    onSuccess: (updatedSlot) => {
      queryClient.setQueryData<CoachingSlot[]>(queryKey, (old = []) =>
        old.map((s) => (s.id === updatedSlot.id ? updatedSlot : s))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: coachingSlotsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteSlot = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    queryClient.setQueryData<CoachingSlot[]>(queryKey, (old = []) =>
      old.filter((s) => s.id !== id)
    );
  };

  const bookMutation = useMutation({
    mutationFn: coachingSlotsApi.book,
    onSuccess: (updatedSlot) => {
      queryClient.setQueryData<CoachingSlot[]>(queryKey, (old = []) =>
        old.map((s) => (s.id === updatedSlot.id ? updatedSlot : s))
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: coachingSlotsApi.cancel,
    onSuccess: (updatedSlot) => {
      queryClient.setQueryData<CoachingSlot[]>(queryKey, (old = []) =>
        old.map((s) => (s.id === updatedSlot.id ? updatedSlot : s))
      );
    },
  });

  return {
    slots,
    loading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    createSlot: createMutation.mutateAsync,
    updateSlot: (
      id: string,
      slotData: Parameters<typeof coachingSlotsApi.update>[1]
    ) => updateMutation.mutateAsync({ id, data: slotData }),
    deleteSlot,
    bookSlot: bookMutation.mutateAsync,
    cancelBooking: cancelMutation.mutateAsync,
    refetch,
  };
}
