"use client";

import { Video, Users } from "lucide-react";

interface SessionCardProps {
  session: {
    id: string;
    type: "lecture" | "workshop" | "coaching";
    title: string;
    program: string;
    location: string;
    locationType: "online" | "on-campus";
    participants?: number;
  };
  date?: Date;
  time?: string;
  endTime?: string;
  onClick?: () => void;
}

export const SessionCard = ({
  session,
  date,
  time,
  endTime,
  onClick,
}: SessionCardProps) => {
  // Check if session is in the past (after end time)
  const isPast = date
    ? (() => {
        const now = new Date();
        const sessionEndDateTime = new Date(date);
        // Use endTime if available, otherwise use start time, otherwise use end of day
        if (endTime) {
          const [hours, minutes] = endTime.split(":").map(Number);
          sessionEndDateTime.setHours(hours, minutes, 0, 0);
        } else if (time) {
          const [hours, minutes] = time.split(":").map(Number);
          sessionEndDateTime.setHours(hours, minutes, 0, 0);
        } else {
          sessionEndDateTime.setHours(23, 59, 59, 999);
        }
        return sessionEndDateTime < now;
      })()
    : false;

  const typeColors = {
    lecture: {
      online: {
        bg: "bg-purple-50/10 hover:bg-purple-50/20",
        border: "border-purple-100 border-l-purple-500",
        text: "text-purple-600",
      },
      "on-campus": {
        bg: "bg-blue-50/10 hover:bg-blue-50/20",
        border: "border-blue-100 border-l-blue-500",
        text: "text-blue-600",
      },
    },
    workshop: {
      bg: "bg-blue-50/10 hover:bg-blue-50/20",
      border: "border-blue-100 border-l-blue-500",
      text: "text-blue-600",
    },
    coaching: {
      bg: "",
      border: "border-amber-100 border-l-amber-500",
      text: "text-amber-600",
    },
  };

  let colors;
  if (session.type === "lecture") {
    colors =
      typeColors.lecture[session.locationType] ||
      typeColors.lecture["on-campus"];
  } else {
    colors = typeColors[session.type] || typeColors.lecture["on-campus"];
  }

  return (
    <div
      className={`p-0 ${colors.bg} relative transition-colors ${
        onClick ? "cursor-pointer" : ""
      } overflow-hidden`}
      onClick={onClick}
    >
      <div
        className={`h-full w-full bg-white border rounded-lg p-3 shadow-sm border-l-[3px] ${
          colors.border
        } flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden ${
          isPast ? "opacity-50" : ""
        }`}
      >
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-2 mb-1">
            <p
              className={`text-[10px] font-bold uppercase tracking-wide ${colors.text} shrink-0`}
            >
              {session.type === "lecture"
                ? "Vorlesung"
                : session.type === "workshop"
                ? "Workshop"
                : "Coaching"}
            </p>
            {session.locationType === "online" && (
              <Video className="w-3 h-3 text-zinc-300 group-hover:text-blue-500 transition-colors shrink-0" />
            )}
            {session.type === "coaching" && session.participants && (
              <div className="flex -space-x-1.5 shrink-0">
                {Array.from({ length: Math.min(session.participants, 2) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full bg-zinc-200 border border-white"
                    ></div>
                  )
                )}
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-zinc-900 leading-tight line-clamp-2 break-words">
            {session.title}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1 truncate">
            {session.program} •{" "}
            {session.locationType === "online" ? "Online" : session.location}
          </p>
        </div>
      </div>
    </div>
  );
};
