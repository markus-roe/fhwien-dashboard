import { Calendar, Users, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CoachingSlot, Course } from "@/data/mockData";
import {
  getDateLabel,
  getDateClasses,
  isCoachingSlotPast,
} from "@/lib/dashboardUtils";

type CoachingSlotRowProps = {
  slot: CoachingSlot;
  course?: Course;
  onEdit: (slot: CoachingSlot) => void;
  onDelete: (slot: CoachingSlot) => void;
};

export function CoachingSlotRow({
  slot,
  course,
  onEdit,
  onDelete,
}: CoachingSlotRowProps) {
  const isPastSlot = isCoachingSlotPast(slot);
  const date = new Date(slot.date);
  const dateClasses = getDateClasses(date);

  return (
    <div
      className={`group grid gap-3 px-4 py-2.5 items-center hover:bg-zinc-50 transition-colors grid-cols-[140px,100px,180px,200px,1fr,auto] ${
        isPastSlot ? "opacity-60" : ""
      }`}
    >
      {/* Datum */}
      <div className="text-xs">
        <div className="flex items-center gap-1.5">
          <Calendar
            className={`w-3.5 h-3.5 shrink-0 ${dateClasses.iconClass}`}
          />
          <span className={dateClasses.textClass}>{getDateLabel(date)}</span>
        </div>
      </div>

      {/* Zeit */}
      <div className="text-xs font-medium text-zinc-900 tabular-nums">
        {slot.time}
        {slot.endTime && (
          <span className="text-zinc-500"> – {slot.endTime}</span>
        )}
      </div>

      {/* Fach */}
      <div className="text-xs font-medium text-zinc-700 truncate">
        {course?.title || "Unbekannt"}
      </div>

      {/* Teilnehmer */}
      <div className="text-xs text-zinc-600">
        {slot.participants.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {slot.participants.map((participant) => (
              <span
                key={participant}
                className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700"
              >
                {participant}
              </span>
            ))}
            <span className="text-[11px] text-zinc-500 ml-1">
              ({slot.participants.length}/{slot.maxParticipants})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-zinc-400">0/{slot.maxParticipants}</span>
          </div>
        )}
      </div>

      {/* Beschreibung */}
      <div className="text-xs text-zinc-600 truncate">
        {slot.description || "—"}
      </div>

      {/* Aktionen */}
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
  );
}
