import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { CoachingSlot } from "@/data/mockData";

export type TimeGroup = {
  timeKey: string;
  timeLabel: string;
  slots: CoachingSlot[];
};

export type DayGroup = {
  dayKey: string;
  dayLabel: string;
  date: Date;
  timeGroups: TimeGroup[];
};

export function groupSlotsByDay(slots: CoachingSlot[]): DayGroup[] {
  // Group slots by day
  const dayMap = new Map<string, CoachingSlot[]>();
  slots.forEach((slot) => {
    const slotDate = new Date(slot.date);
    const dayKey = format(slotDate, "yyyy-MM-dd");

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, []);
    }
    dayMap.get(dayKey)!.push(slot);
  });

  // Convert day map to array and sort, then group by time
  const days: DayGroup[] = Array.from(dayMap.entries())
    .map(([dayKey, daySlots]) => {
      const dayDate = new Date(daySlots[0].date);

      // Sort slots by time
      daySlots.sort((a, b) => a.time.localeCompare(b.time));

      // Group slots by time
      const timeMap = new Map<string, CoachingSlot[]>();
      daySlots.forEach((slot) => {
        const timeKey = slot.time;
        if (!timeMap.has(timeKey)) {
          timeMap.set(timeKey, []);
        }
        timeMap.get(timeKey)!.push(slot);
      });

      // Convert time map to array and sort
      const timeGroups: TimeGroup[] = Array.from(timeMap.entries())
        .map(([timeKey, timeSlots]) => ({
          timeKey,
          timeLabel: `${timeKey} - ${timeSlots[0].endTime}`,
          slots: timeSlots,
        }))
        .sort((a, b) => a.timeKey.localeCompare(b.timeKey));

      return {
        dayKey,
        dayLabel: format(dayDate, "EEEE, d. MMMM", { locale: de }),
        date: dayDate,
        timeGroups,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return days;
}

