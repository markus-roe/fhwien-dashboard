"use client";

import { useState } from "react";
import {
  format,
  isToday,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
} from "date-fns";
import { de } from "date-fns/locale";
import { Video, MapPin, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import type { Session } from "@/shared/lib/api-types";

interface ListViewProps {
  sessions: Session[];
  onSessionClick?: (sessionId: number) => void;
}

export const ListView = ({ sessions, onSessionClick }: ListViewProps) => {
  const [showPastSessions, setShowPastSessions] = useState(false);
  const today = startOfDay(new Date());

  // Separate past and future sessions
  const pastSessions = sessions.filter((session) => {
    const sessionDate = startOfDay(session.date);
    return sessionDate < today;
  });

  const futureSessions = sessions.filter((session) => {
    const sessionDate = startOfDay(session.date);
    return sessionDate >= today;
  });

  // Combine sessions: show past only if toggle is on
  const sessionsToShow = showPastSessions
    ? [...pastSessions, ...futureSessions]
    : futureSessions;

  // Sort sessions by date and time
  const sortedSessions = [...sessionsToShow].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const [aHours, aMinutes] = a.time.split(":").map(Number);
    const [bHours, bMinutes] = b.time.split(":").map(Number);

    dateA.setHours(aHours, aMinutes, 0, 0);
    dateB.setHours(bHours, bMinutes, 0, 0);

    return dateA.getTime() - dateB.getTime();
  });

  // Group sessions by date
  const sessionsByDate = new Map<string, Session[]>();

  sortedSessions.forEach((session) => {
    const dateKey = format(session.date, "yyyy-MM-dd");
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, []);
    }
    sessionsByDate.get(dateKey)!.push(session);
  });

  const getDateLabel = (date: Date) => {
    if (isToday(date)) {
      return "Heute";
    }
    if (isPast(date) && !isToday(date)) {
      return format(date, "EEEE, d. MMM", { locale: de });
    }
    if (isFuture(date)) {
      return format(date, "EEEE, d. MMM", { locale: de });
    }
    return format(date, "EEEE, d. MMM", { locale: de });
  };

  // Check if there are past sessions to show toggle
  const hasPastSessions = pastSessions.length > 0;

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* Toggle for past sessions */}
      {hasPastSessions && (
        <div className="sticky top-0 z-20 bg-white border-b border-zinc-200 px-4 py-3 flex-shrink-0">
          <button
            onClick={() => setShowPastSessions(!showPastSessions)}
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            {showPastSessions ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>
                  Vergangene Events ausblenden ({pastSessions.length})
                </span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Vergangene Events anzeigen ({pastSessions.length})</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-4 p-3">
          {Array.from(sessionsByDate.entries()).map(
            ([dateKey, daySessions]) => {
              const date = new Date(dateKey);
              const isPastDate = isPast(date) && !isToday(date);

              return (
                <div key={dateKey} className="space-y-2">
                  {/* Date Header */}
                  <div
                    className={`flex items-center gap-2 sticky ${
                      hasPastSessions ? "top-[57px]" : "top-0"
                    } bg-white py-1.5 z-10 border-b border-zinc-200`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <h3
                      className={`text-xs font-semibold ${
                        isPastDate ? "text-zinc-400" : "text-zinc-900"
                      }`}
                    >
                      {getDateLabel(date)}
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {daySessions.length}{" "}
                      {daySessions.length === 1 ? "Sitzung" : "Sitzungen"}
                    </span>
                  </div>

                  {/* Sessions for this date */}
                  <div className="space-y-1.5 pl-5">
                    {daySessions.map((session) => {
                      const sessionDateTime = new Date(session.date);
                      const [hours, minutes] = session.time
                        .split(":")
                        .map(Number);
                      sessionDateTime.setHours(hours, minutes, 0, 0);

                      // Calculate end time
                      const sessionEndDateTime = new Date(session.date);
                      if (session.endTime) {
                        const [endHours, endMinutes] = session.endTime
                          .split(":")
                          .map(Number);
                        sessionEndDateTime.setHours(endHours, endMinutes, 0, 0);
                      } else {
                        // Fallback to start time if no end time
                        sessionEndDateTime.setHours(hours, minutes, 0, 0);
                      }

                      const now = new Date();
                      const isLive =
                        session.isLive ||
                        (sessionDateTime <= now &&
                          new Date(
                            sessionDateTime.getTime() + 2 * 60 * 60 * 1000
                          ) >= now);
                      // Check if session has ended (after end time)
                      const isPastSession = sessionEndDateTime < now;

                      return (
                        <div
                          key={session.id}
                          className={`bg-white border border-zinc-200 rounded-md p-2.5 hover:shadow-sm transition-all cursor-pointer ${
                            isPastSession && "opacity-60"
                          }`}
                          onClick={() => onSessionClick?.(session.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Time Column */}
                            <div className="flex-shrink-0 w-16">
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-zinc-900 tabular-nums leading-tight">
                                  {session.time}
                                </span>
                                {session.endTime && (
                                  <span className="text-[10px] text-zinc-500 tabular-nums leading-tight">
                                    {session.endTime}
                                  </span>
                                )}
                              </div>
                              {isLive && (
                                <span className="text-[9px] inline-block mt-0.5 font-medium text-red-600 leading-tight">
                                  LIVE
                                </span>
                              )}
                            </div>

                            {/* Session Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span
                                      className={`text-[9px] font-bold uppercase tracking-wide ${
                                        session.type === "lecture"
                                          ? session.locationType === "online"
                                            ? "text-purple-600"
                                            : "text-blue-600"
                                          : session.type === "workshop"
                                          ? "text-blue-600"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {session.type === "lecture"
                                        ? "Vorlesung"
                                        : session.type === "workshop"
                                        ? "Workshop"
                                        : "Coaching"}
                                    </span>
                                    {session.attendance === "mandatory" && (
                                      <span className="text-[9px] text-zinc-500">
                                        • Pflicht
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-semibold text-zinc-900 leading-tight mb-0.5 line-clamp-2">
                                    {session.title}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
                                    <div className="flex items-center gap-0.5">
                                      {session.locationType === "online" ? (
                                        <>
                                          <Video className="w-2.5 h-2.5" />
                                          <span className="truncate">
                                            {session.location}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <MapPin className="w-2.5 h-2.5" />
                                          <span className="truncate">
                                            {session.location}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    {session.duration && (
                                      <>
                                        <span>•</span>
                                        <span>{session.duration}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};
