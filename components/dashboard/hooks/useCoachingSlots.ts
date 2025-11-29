import { useMemo } from "react";
import type { CoachingSlot } from "@/data/mockData";
import {
  sortCoachingSlotsByDateTime,
  isCoachingSlotPast,
  getCoachingSlotEndDateTime,
} from "@/lib/dashboardUtils";

export function useCoachingSlots(
  slots: CoachingSlot[],
  showPastSlots: boolean
) {
  const now = new Date();

  const sortedSlots = useMemo(
    () => sortCoachingSlotsByDateTime(slots),
    [slots]
  );

  const pastSlots = useMemo(
    () => sortedSlots.filter((slot) => isCoachingSlotPast(slot)),
    [sortedSlots]
  );

  const slotsToShow = useMemo(() => {
    if (showPastSlots) {
      return sortedSlots;
    }
    return sortedSlots.filter((slot) => {
      const slotEndDateTime = getCoachingSlotEndDateTime(slot);
      return slotEndDateTime >= now;
    });
  }, [sortedSlots, showPastSlots, now]);

  return {
    sortedSlots,
    pastSlots,
    slotsToShow,
  };
}
