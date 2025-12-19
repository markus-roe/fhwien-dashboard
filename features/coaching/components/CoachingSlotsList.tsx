import { ChevronDown, ChevronUp } from "lucide-react";
import type { CoachingSlot, Course } from "@/shared/data/mockData";
import { CoachingSlotCard } from "./CoachingSlotCard";
import { groupSlotsByDay } from "@/features/coaching/utils/coachingSlotUtils";

type CoachingSlotsListProps = {
  upcomingSlots: CoachingSlot[];
  pastSlots: CoachingSlot[];
  courses: Course[];
  onBook: (slotId: string) => void;
  onCancelBooking: (slotId: string) => void;
  onDelete: (slotId: string) => void;
  showPastSlots?: boolean;
  onTogglePastSlots?: () => void;
  emptyMessage?: {
    title: string;
    description: string;
  };
  pastSlotsLabel?: string;
};

export function CoachingSlotsList({
  upcomingSlots,
  pastSlots,
  courses,
  onBook,
  onCancelBooking,
  onDelete,
  showPastSlots = false,
  onTogglePastSlots,
  emptyMessage,
  pastSlotsLabel = "Vergangene Coachings",
}: CoachingSlotsListProps) {
  const upcomingSlotsByDay = groupSlotsByDay(upcomingSlots);
  const pastSlotsByDay = groupSlotsByDay(pastSlots);

  if (upcomingSlots.length === 0 && pastSlots.length === 0) {
    if (emptyMessage) {
      return (
        <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
          <p className="text-sm text-zinc-600 mb-1">{emptyMessage.title}</p>
          <p className="text-xs text-zinc-500">{emptyMessage.description}</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Upcoming slots */}
      {upcomingSlotsByDay.length > 0 &&
        upcomingSlotsByDay.map((dayGroup) => (
          <div key={dayGroup.dayKey} className="space-y-3">
            <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
              {dayGroup.dayLabel}
            </h4>
            {dayGroup.timeGroups.map((timeGroup) => (
              <div key={timeGroup.timeKey} className="space-y-2">
                <h5 className="text-xs font-medium text-zinc-500">
                  {timeGroup.timeLabel}
                </h5>
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {timeGroup.slots.map((slot) => (
                    <div key={slot.id} id={`slot-${slot.id}`}>
                      <CoachingSlotCard
                        slot={slot}
                        course={courses.find((c) => c.id === slot.courseId)}
                        isProfessor={false}
                        onBook={onBook}
                        onCancelBooking={onCancelBooking}
                        onDelete={onDelete}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* Past slots - collapsible */}
      {pastSlotsByDay.length > 0 && onTogglePastSlots && (
        <div className="space-y-4">
          <button
            onClick={onTogglePastSlots}
            className="flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            {showPastSlots ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>
              {pastSlotsLabel} ({pastSlots.length})
            </span>
          </button>
          {showPastSlots &&
            pastSlotsByDay.map((dayGroup) => (
              <div key={dayGroup.dayKey} className="space-y-3 opacity-60">
                <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                  {dayGroup.dayLabel}
                </h4>
                {dayGroup.timeGroups.map((timeGroup) => (
                  <div key={timeGroup.timeKey} className="space-y-2">
                    <h5 className="text-xs font-medium text-zinc-500">
                      {timeGroup.timeLabel}
                    </h5>
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                      {timeGroup.slots.map((slot) => (
                        <div key={slot.id} id={`slot-${slot.id}`}>
                          <CoachingSlotCard
                            slot={slot}
                            course={courses.find((c) => c.id === slot.courseId)}
                            isProfessor={false}
                            onBook={onBook}
                            onCancelBooking={onCancelBooking}
                            onDelete={onDelete}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
