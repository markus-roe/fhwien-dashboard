import { Calendar, MapPin, Video, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { Session, Course } from "@/shared/data/mockData";
import {
  getDateLabel,
  getDateClasses,
  isSessionPast,
} from "@/shared/lib/dashboardUtils";
import { isToday } from "date-fns";

type SessionRowProps = {
  session: Session;
  course?: Course;
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
};

export function SessionRow({
  session,
  course,
  onEdit,
  onDelete,
}: SessionRowProps) {
  const isPastSession = isSessionPast(session);
  const date = new Date(session.date);
  const dateClasses = getDateClasses(date);

  return (
    <div
      className={`group grid gap-3 px-4 py-2.5 items-center hover:bg-zinc-50 transition-colors grid-cols-[140px,100px,180px,1fr,180px,auto] ${
        isPastSession ? "opacity-60" : ""
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
        {session.time}
        {session.endTime && (
          <span className="text-zinc-500"> – {session.endTime}</span>
        )}
      </div>

      {/* Fach */}
      <div className="text-xs font-medium text-zinc-700 truncate">
        {course?.title || "Unbekannt"}
      </div>

      {/* Titel */}
      <div className="text-xs font-medium text-zinc-900 truncate">
        {session.title}
      </div>

      {/* Ort */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
        {session.locationType === "online" ? (
          <>
            <Video className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{session.location || "Online"}</span>
          </>
        ) : (
          <>
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{session.location || "Kein Ort"}</span>
          </>
        )}
      </div>

      {/* Aktionen */}
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="secondary"
          className="h-7 w-7 p-0"
          onClick={() => onEdit(session)}
          title="Bearbeiten"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 w-7 p-0"
          onClick={() => onDelete(session)}
          title="Löschen"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
