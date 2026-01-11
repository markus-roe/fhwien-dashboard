import { useMemo } from "react";
import type { CoachingSlot, Course } from "@/shared/lib/api-types";

type UseDashboardCoachingSlotFiltersProps = {
  allSlots: CoachingSlot[];
  courses: Course[];
  selectedCourseId: number | null;
  searchQuery: string;
};

export function useDashboardCoachingSlotFilters({
  allSlots,
  courses,
  selectedCourseId,
  searchQuery,
}: UseDashboardCoachingSlotFiltersProps) {
  const filteredSlots = useMemo(() => {
    let filtered = allSlots;

    if (selectedCourseId) {
      filtered = filtered.filter((slot) => slot.courseId === selectedCourseId);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((slot) => {
        const course = courses.find((c) => c.id === slot.courseId);
        return (
          slot.description?.toLowerCase().includes(query) ||
          course?.title.toLowerCase().includes(query) ||
          slot.participants.some((p) => p.name.toLowerCase().includes(query)) ||
          false
        );
      });
    }

    return filtered;
  }, [allSlots, selectedCourseId, searchQuery, courses]);

  return {
    filteredSlots,
  };
}
