import { useMemo } from "react";
import type { User, Program } from "@/shared/data/mockData";

type UseDashboardUserFiltersProps = {
  allUsers: User[];
  programFilter: Program | "all";
  searchQuery: string;
};

export function useDashboardUserFilters({
  allUsers,
  programFilter,
  searchQuery,
}: UseDashboardUserFiltersProps) {
  const filteredUsers = useMemo(() => {
    let filtered = allUsers;

    if (programFilter !== "all") {
      filtered = filtered.filter((user) => user.program === programFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allUsers, programFilter, searchQuery]);

  return {
    filteredUsers,
  };
}
