import { Calendar, Users, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CoachingSlot, Course } from "@/data/mockData";
import {
  getDateLabel,
  getDateClasses,
  isCoachingSlotPast,
} from "@/lib/dashboardUtils";

type CoachingSlotCardProps = {
  slot: CoachingSlot;
  course?: Course;
  onEdit: (slot: CoachingSlot) => void;
  onDelete: (slot: CoachingSlot) => void;
};

export function CoachingSlotCard({
  slot,
  course,
  onEdit,
  onDelete,
}: CoachingSlotCardProps) {
  const isPastSlot = isCoachingSlotPast(slot);
  const date = new Date(slot.date);
  const dateClasses = getDateClasses(date);

  return (
    <div
      className={`group bg-white border border-zinc-200 rounded-md p-3 ${
        isPastSlot ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar
              className={`w-3.5 h-3.5 shrink-0 ${dateClasses.iconClass}`}
            />
            <span className={`text-xs font-medium ${dateClasses.textClass}`}>
              {getDateLabel(date)}
            </span>
            <span className="text-xs font-semibold text-zinc-900 tabular-nums">
              {slot.time}
              {slot.endTime && (
                <span className="text-zinc-500"> – {slot.endTime}</span>
              )}
            </span>
          </div>
          {course && (
            <div className="text-[10px] font-medium text-zinc-600 mb-0.5">
              {course.title}
            </div>
          )}
          <div className="text-[10px] text-zinc-600 mb-1">
            {slot.participants.length > 0 ? (
              <div className="flex flex-wrap gap-1 items-center">
                {slot.participants.map((participant) => (
                  <span
                    key={participant}
                    className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-700"
                  >
                    {participant}
                  </span>
                ))}
                <span className="text-[10px] text-zinc-500 ml-1">
                  ({slot.participants.length}/{slot.maxParticipants})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="text-zinc-400">0/{slot.maxParticipants}</span>
              </div>
            )}
          </div>
          {slot.description && (
            <p className="text-[10px] text-zinc-600 leading-relaxed">
              {slot.description}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(slot)}
            title="Bearbeiten"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 w-7 p-0"
            onClick={() => onDelete(slot)}
            title="Löschen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
