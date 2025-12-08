import { useMemo } from "react";
import type { Group, Course } from "@/data/mockData";
import { currentUser } from "@/data/mockData";

type UseGroupFiltersProps = {
  allGroups: Group[];
  courses: Course[];
  selectedCourseId: string | null;
  searchQuery: string;
};

export function useGroupFilters({
  allGroups,
  courses,
  selectedCourseId,
  searchQuery,
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
          g.members.some((m) => m.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCourseId, allGroups, searchQuery, courses]);

  const myGroups = useMemo(() => {
    return filteredGroups.filter((g) =>
      g.members.some((m) => m === currentUser.name)
    );
  }, [filteredGroups]);

  const totalMyGroupsCount = useMemo(() => {
    return allGroups.filter((g) =>
      g.members.some((m) => m === currentUser.name)
    ).length;
  }, [allGroups]);

  return {
    totalGroupCount,
    courseGroupCounts,
    filteredGroups,
    myGroups,
    totalMyGroupsCount,
  };
}
