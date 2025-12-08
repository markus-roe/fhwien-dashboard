import type { Session } from "@/shared/data/mockData";
import { Monitor, Video, MapPin } from "lucide-react";
import { Avatar } from "@/shared/components/ui/Avatar";

interface SessionPanelDetailsProps {
  session: Session;
}

export const SessionPanelDetails = ({ session }: SessionPanelDetailsProps) => {
  return (
    <>
      {/* Quick Actions */}
      {session.locationType === "online" && (
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] shadow-sm">
            <Video className="w-4 h-4" />
            Teams beitreten
          </button>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-y-6 gap-x-8">
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
            Zeit
          </p>
          <p className="text-sm font-medium text-zinc-900">
            {session.time} – {session.endTime}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {session.duration} Dauer
          </p>
        </div>
        {session.lecturer && (
          <div>
            <p className="text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
              Dozent
            </p>
            <div className="flex items-center gap-2.5">
              <Avatar
                initials={session.lecturer.initials}
                size="sm"
                className="bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 border-indigo-200"
              />
              <p className="text-sm font-medium text-zinc-900">
                {session.lecturer.name}
              </p>
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
            Ort
          </p>
          <div className="flex items-center gap-1.5">
            {session.locationType === "online" ? (
              <Monitor className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <p className="text-sm font-medium text-zinc-900">
              {session.locationType === "online" ? "Online" : session.location}
            </p>
          </div>
          {session.locationType === "online" && (
            <p className="text-xs text-zinc-500 mt-0.5 pl-5">
              {session.location}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
            Anwesenheit
          </p>
          <p
            className={`text-sm font-medium flex items-center gap-1.5 ${
              session.attendance === "mandatory"
                ? "text-emerald-600"
                : "text-zinc-600"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {session.attendance === "mandatory" ? "Pflicht" : "Optional"}
          </p>
        </div>
      </div>
    </>
  );
};
