import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/shared/lib/api";
import type { Group, UpdateGroupRequest } from "@/shared/lib/api-types";

export function useGroups(courseId?: number) {
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
      id: number;
      data: UpdateGroupRequest;
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

  const deleteGroup = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    queryClient.setQueryData<Group[]>(queryKey, (old = []) =>
      old.filter((g) => g.id !== id)
    );
  };

  const joinMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      groupsApi.join(groupId, userId),
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData<Group[]>(queryKey, (old = []) =>
        old.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
      );
    },
  });

  const leaveMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      groupsApi.leave(groupId, userId),
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
      id: number,
      groupData: Parameters<typeof groupsApi.update>[1]
    ) => updateMutation.mutateAsync({ id, data: groupData }),
    deleteGroup,
    joinGroup: (groupId: number, userId: number) =>
      joinMutation.mutateAsync({ groupId, userId }),
    leaveGroup: (groupId: number, userId: number) =>
      leaveMutation.mutateAsync({ groupId, userId }),
    refetch,
  };
}
