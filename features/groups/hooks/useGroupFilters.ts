import { useMemo } from "react";
import type { Group, Course, User } from "@/shared/lib/api-types";

type UseGroupFiltersProps = {
  allGroups: Group[];
  courses: Course[];
  selectedCourseId: number | null;
  searchQuery: string;
  currentUser: User;
};

export function useGroupFilters({
  allGroups,
  courses,
  selectedCourseId,
  searchQuery,
  currentUser,
}: UseGroupFiltersProps) {
  const totalGroupCount = allGroups.length;

  const courseGroupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    courses.forEach((course) => {
      counts[course.id] = 0;
    });
    allGroups.forEach((group) => {
      counts[group.courseId] = (counts[group.courseId] ?? 0) + 1;
    });
    return counts;
  }, [allGroups, courses]);

  const filteredGroups = useMemo(() => {
    let filtered = allGroups;

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((g) => g.courseId === selectedCourseId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query) ||
          courses
            .find((c) => c.id === g.courseId)
            ?.title.toLowerCase()
            .includes(query) ||
          g.members.some((m) => m.name.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCourseId, allGroups, searchQuery, courses]);

  // Nur Gruppen filtern, wenn currentUser vorhanden ist
  const myGroups = useMemo(() => {
    if (!currentUser) return [];
    return filteredGroups.filter((g) =>
      g.members.some((m) => m.id === currentUser.id)
    );
  }, [filteredGroups, currentUser]);

  const totalMyGroupsCount = useMemo(() => {
    if (!currentUser) return 0;
    return allGroups.filter((g) =>
      g.members.some((m) => m.id === currentUser.id)
    ).length;
  }, [allGroups, currentUser]);

  return {
    totalGroupCount,
    courseGroupCounts,
    filteredGroups,
    myGroups,
    totalMyGroupsCount,
  };
}
