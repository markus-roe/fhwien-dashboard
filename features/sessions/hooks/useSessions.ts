import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "@/shared/lib/api";
import type { Session, UpdateSessionRequest } from "@/shared/lib/api-types";

export function useSessions() {
  const queryClient = useQueryClient();
  const queryKey = ["sessions"];

  const {
    data: sessions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<Session[]>({
    queryKey,
    queryFn: () => sessionsApi.getAll(),
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
    mutationFn: ({ id, data }: { id: number; data: UpdateSessionRequest }) =>
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

  const deleteSession = async (sessionId: number) => {
    await deleteMutation.mutateAsync(sessionId);
    queryClient.setQueryData<Session[]>(queryKey, (old = []) => old.filter((s) => s.id !== sessionId));
  };

  return { sessions, loading, error: error instanceof Error ? error.message : error ? String(error) : null, createSession: createMutation.mutateAsync, updateSession: (id: number, sessionData: Parameters<typeof sessionsApi.update>[1]) => updateMutation.mutateAsync({ id, data: sessionData }), deleteSession, refetch };
}
