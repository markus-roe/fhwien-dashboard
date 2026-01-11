import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coachingSlotsApi } from "@/shared/lib/api";
import type { CoachingSlot } from "@/shared/lib/api-types";

export function useCoachingSlots() {
  const queryClient = useQueryClient();
  const queryKey = ["coaching-slots"];

  const {
    data: slots = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<CoachingSlot[]>({
    queryKey,
    queryFn: () => coachingSlotsApi.getAll(),
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
      id: number;
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

  const deleteSlot = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    queryClient.setQueryData<CoachingSlot[]>(queryKey, (old = []) =>
      old.filter((s) => s.id !== id)
    );
  };

  const bookMutation = useMutation({
    mutationFn: ({ slotId, userId }: { slotId: number; userId: number }) =>
      coachingSlotsApi.book(slotId, userId),
    onSuccess: (updatedSlot) => {
      queryClient.setQueryData<CoachingSlot[]>(queryKey, (old = []) =>
        old.map((s) => (s.id === updatedSlot.id ? updatedSlot : s))
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ slotId, userId }: { slotId: number; userId: number }) =>
      coachingSlotsApi.cancel(slotId, userId),
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
      id: number,
      slotData: Parameters<typeof coachingSlotsApi.update>[1]
    ) => updateMutation.mutateAsync({ id, data: slotData }),
    deleteSlot,
    bookSlot: (slotId: number, userId: number) =>
      bookMutation.mutateAsync({ slotId, userId }),
    cancelBooking: (slotId: number, userId: number) =>
      cancelMutation.mutateAsync({ slotId, userId }),
    refetch,
  };
}
