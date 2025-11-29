import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import type { User, Program } from "@/data/mockData";

export function useUsers(params?: { program?: Program | "all"; search?: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["users", params?.program, params?.search];

  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<User[]>({
    queryKey,
    queryFn: () => usersApi.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: (newUser) => {
      queryClient.setQueryData<User[]>(queryKey, (old = []) => [
        ...old,
        newUser,
      ]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof usersApi.update>[1] }) =>
      usersApi.update(id, data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData<User[]>(queryKey, (old = []) =>
        old.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteUser = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    queryClient.setQueryData<User[]>(queryKey, (old = []) =>
      old.filter((u) => u.id !== id)
    );
  };

  return {
    users,
    loading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    createUser: createMutation.mutateAsync,
    updateUser: (id: string, userData: Parameters<typeof usersApi.update>[1]) =>
      updateMutation.mutateAsync({ id, data: userData }),
    deleteUser,
    refetch,
  };
}

