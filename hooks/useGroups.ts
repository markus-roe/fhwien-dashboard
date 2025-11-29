import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api";
import type { Group } from "@/data/mockData";

export function useGroups(courseId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["groups", courseId];

  const {
    data: groups = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<Group[]>({
    queryKey,
    queryFn: () => groupsApi.getAll(courseId ? { courseId } : undefined),
  });

  const createMutation = useMutation({
    mutationFn: groupsApi.create,
    onSuccess: (newGroup) => {
      queryClient.setQueryData<Group[]>(queryKey, (old = []) => [
        ...old,
        newGroup,
      ]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof groupsApi.update>[1];
    }) => groupsApi.update(id, data),
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData<Group[]>(queryKey, (old = []) =>
        old.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: groupsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteGroup = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    queryClient.setQueryData<Group[]>(queryKey, (old = []) =>
      old.filter((g) => g.id !== id)
    );
  };

  const joinMutation = useMutation({
    mutationFn: groupsApi.join,
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData<Group[]>(queryKey, (old = []) =>
        old.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
      );
    },
  });

  const leaveMutation = useMutation({
    mutationFn: groupsApi.leave,
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData<Group[]>(queryKey, (old = []) =>
        old.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
      );
    },
  });

  return {
    groups,
    loading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    createGroup: createMutation.mutateAsync,
    updateGroup: (
      id: string,
      groupData: Parameters<typeof groupsApi.update>[1]
    ) => updateMutation.mutateAsync({ id, data: groupData }),
    deleteGroup,
    joinGroup: joinMutation.mutateAsync,
    leaveGroup: leaveMutation.mutateAsync,
    refetch,
  };
}
