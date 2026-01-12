import { useMemo } from "react";
import type { CoachingSlot } from "@/shared/lib/api-types";
import {
  sortCoachingSlotsByDateTime,
  isCoachingSlotPast,
  getCoachingSlotEndDateTime,
} from "@/shared/lib/dashboardUtils";

export function useCoachingSlots(
  slots: CoachingSlot[],
  showPastSlots: boolean
) {
  const { pastSlots, upcomingSlots } = useMemo(() => {
    const past: CoachingSlot[] = [];
    const upcoming: CoachingSlot[] = [];

    slots.forEach((slot) => {
      if (isCoachingSlotPast(slot)) {
        past.push(slot);
      } else {
        upcoming.push(slot);
      }
    });

    // Sort: upcoming ascending, past descending
    const sortedPast = [...past].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      return b.time.localeCompare(a.time);
    });

    return {
      pastSlots: sortedPast,
      upcomingSlots: sortCoachingSlotsByDateTime(upcoming),
    };
  }, [slots]);

  const slotsToShow = useMemo(() => {
    return showPastSlots
      ? [...upcomingSlots, ...pastSlots]
      : upcomingSlots;
  }, [showPastSlots, upcomingSlots, pastSlots]);

  return {
    pastSlots,
    slotsToShow,
  };
}

