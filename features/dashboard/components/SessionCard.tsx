import { Calendar, MapPin, Video, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { Session, Course } from "@/shared/data/mockData";
import {
  getDateLabel,
  getDateClasses,
  isSessionPast,
} from "@/shared/lib/dashboardUtils";

type SessionCardProps = {
  session: Session;
  course?: Course;
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
};

export function SessionCard({
  session,
  course,
  onEdit,
  onDelete,
}: SessionCardProps) {
  const isPastSession = isSessionPast(session);
  const date = new Date(session.date);
  const dateClasses = getDateClasses(date);

  return (
    <div
      className={`group bg-white border border-zinc-200 rounded-md p-3 ${
        isPastSession ? "opacity-60" : ""
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
              {session.time}
              {session.endTime && (
                <span className="text-zinc-500"> – {session.endTime}</span>
              )}
            </span>
          </div>
          {course && (
            <div className="text-[10px] font-medium text-zinc-600 mb-0.5">
              {course.title}
            </div>
          )}
          <h4 className="text-xs font-semibold text-zinc-900 leading-tight mb-1">
            {session.title}
          </h4>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
            {session.locationType === "online" ? (
              <>
                <Video className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{session.location || "Online"}</span>
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">
                  {session.location || "Kein Ort"}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
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
    </div>
  );
}
