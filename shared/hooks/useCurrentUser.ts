import { useQuery } from "@tanstack/react-query";
import { currentUserApi } from "@/shared/lib/api";
import type { User } from "@/shared/data/mockData";

export function useCurrentUser() {
    const {
        data: user,
        isLoading: loading,
        error,
        refetch,
    } = useQuery<User>({
        queryKey: ["current-user"],
        queryFn: () => currentUserApi.get(),
    });

    return {
        user,
        loading,
        error:
            error instanceof Error ? error.message : error ? String(error) : null,
        refetch,
    };
}
