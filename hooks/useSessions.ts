import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "@/lib/api";
import type { Session } from "@/data/mockData";

export function useSessions(courseId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["sessions", courseId];

  const {
    data: sessions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<Session[]>({
    queryKey,
    queryFn: () => sessionsApi.getAll(courseId ? { courseId } : undefined),
  });

  const createMutation = useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: (newSession) => {
      queryClient.setQueryData<Session[]>(queryKey, (old = []) => [
        ...old,
        newSession,
      ]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof sessionsApi.update>[1] }) =>
      sessionsApi.update(id, data),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData<Session[]>(queryKey, (old = []) =>
        old.map((s) => (s.id === updatedSession.id ? updatedSession : s))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteSession = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    queryClient.setQueryData<Session[]>(queryKey, (old = []) =>
      old.filter((s) => s.id !== id)
    );
  };

  return {
    sessions,
    loading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    createSession: createMutation.mutateAsync,
    updateSession: (id: string, sessionData: Parameters<typeof sessionsApi.update>[1]) =>
      updateMutation.mutateAsync({ id, data: sessionData }),
    deleteSession,
    refetch,
  };
}
