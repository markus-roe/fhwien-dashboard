import { useMemo } from "react";
import type { CoachingSlot, Course } from "@/shared/data/mockData";
import { currentUser } from "@/shared/data/mockData";

type UseCoachingSlotFiltersProps = {
  allSlots: CoachingSlot[];
  courses: Course[];
  selectedCourseId: string | null;
  searchQuery: string;
};

export function useCoachingSlotFilters({
  allSlots,
  courses,
  selectedCourseId,
  searchQuery,
}: UseCoachingSlotFiltersProps) {
  // Separate upcoming and past slots from ALL slots
  const { upcomingSlots: allUpcomingSlots, pastSlots: allPastSlots } =
    useMemo(() => {
      const now = new Date();
      const upcoming: CoachingSlot[] = [];
      const past: CoachingSlot[] = [];

      allSlots.forEach((slot) => {
        const slotDateTime = new Date(slot.date);
        slotDateTime.setHours(
          parseInt(slot.time.split(":")[0]),
          parseInt(slot.time.split(":")[1])
        );
        if (slotDateTime >= now) {
          upcoming.push(slot);
        } else {
          past.push(slot);
        }
      });

      return { upcomingSlots: upcoming, pastSlots: past };
    }, [allSlots]);

  const totalSlotCount = allUpcomingSlots.length;

  const courseSlotCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    courses.forEach((course) => {
      counts[course.id] = 0;
    });
    allUpcomingSlots.forEach((slot) => {
      counts[slot.courseId] = (counts[slot.courseId] ?? 0) + 1;
    });
    return counts;
  }, [allUpcomingSlots, courses]);

  // Filter slots by selected course (client-side)
  const filteredAllSlots = useMemo(() => {
    if (!selectedCourseId) return allSlots;
    return allSlots.filter((slot) => slot.courseId === selectedCourseId);
  }, [allSlots, selectedCourseId]);

  // Separate upcoming and past slots from filtered slots
  const { upcomingSlots, pastSlots } = useMemo(() => {
    const now = new Date();
    const upcoming: CoachingSlot[] = [];
    const past: CoachingSlot[] = [];

    filteredAllSlots.forEach((slot) => {
      const slotDateTime = new Date(slot.date);
      slotDateTime.setHours(
        parseInt(slot.time.split(":")[0]),
        parseInt(slot.time.split(":")[1])
      );
      if (slotDateTime >= now) {
        upcoming.push(slot);
      } else {
        past.push(slot);
      }
    });

    return { upcomingSlots: upcoming, pastSlots: past };
  }, [filteredAllSlots]);

  // Filter upcoming slots
  const filteredUpcomingSlots = useMemo(() => {
    let filtered = [...upcomingSlots];

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((slot) => slot.courseId === selectedCourseId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((slot) => {
        const course = courses.find((c) => c.id === slot.courseId);
        return (
          course?.title.toLowerCase().includes(query) ||
          slot.participants.some((p) => p.toLowerCase().includes(query))
        );
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      return a.time.localeCompare(b.time);
    });

    return filtered;
  }, [upcomingSlots, selectedCourseId, searchQuery, courses]);

  // Filter past slots
  const filteredPastSlots = useMemo(() => {
    let filtered = [...pastSlots];

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((slot) => slot.courseId === selectedCourseId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((slot) => {
        const course = courses.find((c) => c.id === slot.courseId);
        return (
          course?.title.toLowerCase().includes(query) ||
          slot.participants.some((p) => p.toLowerCase().includes(query))
        );
      });
    }

    // Sort by date (descending for past slots)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      return b.time.localeCompare(a.time);
    });

    return filtered;
  }, [pastSlots, selectedCourseId, searchQuery, courses]);

  const myUpcomingSlots = useMemo(() => {
    return filteredUpcomingSlots.filter((slot) =>
      slot.participants.some((p) => p === currentUser.name)
    );
  }, [filteredUpcomingSlots]);

  const totalMyBookingsCount = useMemo(() => {
    return allUpcomingSlots.filter((slot) =>
      slot.participants.some((p) => p === currentUser.name)
    ).length;
  }, [allUpcomingSlots]);

  const myPastSlots = useMemo(() => {
    return filteredPastSlots.filter((slot) =>
      slot.participants.some((p) => p === currentUser.name)
    );
  }, [filteredPastSlots]);

  const availableSlots = useMemo(() => {
    return filteredUpcomingSlots;
  }, [filteredUpcomingSlots]);

  return {
    totalSlotCount,
    courseSlotCounts,
    filteredUpcomingSlots,
    filteredPastSlots,
    myUpcomingSlots,
    myPastSlots,
    availableSlots,
    totalMyBookingsCount,
  };
}

