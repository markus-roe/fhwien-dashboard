import { useMemo } from "react";
import type { Session, Course } from "@/shared/lib/api-types";

type UseDashboardSessionFiltersProps = {
  allSessions: Session[];
  courses: Course[];
  selectedCourseId: number | null;
  searchQuery: string;
};

export function useDashboardSessionFilters({
  allSessions,
  courses,
  selectedCourseId,
  searchQuery,
}: UseDashboardSessionFiltersProps) {
  const filteredSessions = useMemo(() => {
    let filtered = allSessions;

    if (selectedCourseId) {
      filtered = filtered.filter(
        (session) => session.courseId === selectedCourseId
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((session) => {
        const course = courses.find((c) => c.id === session.courseId);
        return (
          session.title.toLowerCase().includes(query) ||
          session.location.toLowerCase().includes(query) ||
          course?.title.toLowerCase().includes(query) ||
          false
        );
      });
    }

    return filtered;
  }, [allSessions, selectedCourseId, searchQuery, courses]);

  return {
    filteredSessions,
  };
}

