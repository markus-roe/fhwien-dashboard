"use client";

import { useState } from "react";
import { format, isToday, isPast, isFuture, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { Video, MapPin, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import type { Session } from "@/shared/data/mockData";

interface CalendarListViewProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
}

export function CalendarListView({
  sessions,
  onSessionClick,
}: CalendarListViewProps) {
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
      return format(date, "EEEE, d. MMMM", { locale: de });
    }
    if (isFuture(date)) {
      return format(date, "EEEE, d. MMMM", { locale: de });
    }
    return format(date, "EEEE, d. MMMM  ", { locale: de });
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
        <div className="space-y-6 p-4">
          {Array.from(sessionsByDate.entries()).map(
            ([dateKey, daySessions]) => {
              const date = new Date(dateKey);
              const isPastDate = isPast(date) && !isToday(date);

              return (
                <div key={dateKey} className="space-y-3">
                  {/* Date Header */}
                  <div
                    className={`flex items-center gap-3 ${
                      hasPastSessions ? "top-[57px]" : "top-0"
                    } bg-white py-2 z-10 border-b border-zinc-200`}
                  >
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <h3
                      className={`text-sm font-semibold ${
                        isPastDate ? "text-zinc-400" : "text-zinc-900"
                      }`}
                    >
                      {getDateLabel(date)}
                    </h3>
                  </div>

                  {/* Sessions for this date */}
                  <div className="space-y-2 pl-7">
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
                          className={`bg-white border border-zinc-200 rounded-lg p-4 hover:shadow-md transition-all ${
                            isPastSession && "opacity-60"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            {/* Time Column */}
                            <div className="flex-shrink-0 w-full sm:w-24">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-zinc-900 tabular-nums">
                                  {session.time}
                                </span>
                                {session.endTime && (
                                  <>
                                    <span className="text-zinc-300">–</span>
                                    <span className="text-xs text-zinc-500 tabular-nums">
                                      {session.endTime}
                                    </span>
                                  </>
                                )}
                              </div>
                              {isLive && (
                                <span className="text-[10px] inline-block mt-1 font-medium text-red-600">
                                  seit{" "}
                                  {Math.floor(
                                    (now.getTime() -
                                      sessionDateTime.getTime()) /
                                      (1000 * 60)
                                  )}{" "}
                                  minuten
                                </span>
                              )}
                            </div>

                            {/* Session Info */}
                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => onSessionClick(session)}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-wide ${
                                        session.type === "coaching"
                                          ? "text-amber-600"
                                          : "text-[var(--primary)]"
                                      }`}
                                    >
                                      {session.type === "lecture"
                                        ? "Vorlesung"
                                        : session.type === "workshop"
                                        ? "Workshop"
                                        : "Coaching"}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-zinc-900 leading-tight mb-1">
                                    {session.title}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                                    <div className="flex items-center gap-1">
                                      {session.locationType === "online" ? (
                                        <>
                                          <Video className="w-3 h-3" />
                                          <span>{session.location}</span>
                                        </>
                                      ) : (
                                        <>
                                          <MapPin className="w-3 h-3" />
                                          <span>{session.location}</span>
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
                                <button className="flex-shrink-0 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary)]/80 px-3 py-1.5 rounded-md hover:bg-[var(--primary)]/10 transition-colors sm:mt-0 mt-2 sm:w-auto w-full">
                                  Details anzeigen
                                </button>
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
}
