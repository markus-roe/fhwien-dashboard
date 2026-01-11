import { useMemo } from "react";
import type { Group, Course } from "@/shared/lib/api-types";

type UseDashboardGroupFiltersProps = {
  allGroups: Group[];
  courses: Course[];
  selectedCourseId: number | null;
  searchQuery: string;
};

export function useDashboardGroupFilters({
  allGroups,
  courses,
  selectedCourseId,
  searchQuery,
}: UseDashboardGroupFiltersProps) {
  const filteredGroups = useMemo(() => {
    let filtered = allGroups;

    if (selectedCourseId) {
      filtered = filtered.filter(
        (group) => group.courseId === selectedCourseId
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((group) => {
        const course = courses.find((c) => c.id === group.courseId);
        return (
          group.name.toLowerCase().includes(query) ||
          group.description?.toLowerCase().includes(query) ||
          course?.title.toLowerCase().includes(query) ||
          group.members.some((m) => m.name.toLowerCase().includes(query)) ||
          false
        );
      });
    }

    return filtered;
  }, [allGroups, selectedCourseId, searchQuery, courses]);

  return {
    filteredGroups,
  };
}
