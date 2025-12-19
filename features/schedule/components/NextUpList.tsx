"use client";

import { useMemo } from "react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/Card";
import {
  mockSessions,
  mockCoachingSlots,
  mockCourses,
  currentUser,
} from "@/shared/data/mockData";
import type { Session } from "@/shared/data/mockData";
import { LoadingSkeletonNextUpList } from "@/shared/components/ui/LoadingSkeleton";

interface NextUpListProps {
  onSessionClick?: (sessionId: string) => void;
  title: string;
  emptyMessage?: string;
  loading?: boolean;
}

export const NextUpList = ({
  onSessionClick,
  title,
  emptyMessage = "Keine Sessions geplant.",
  loading = false,
}: NextUpListProps) => {
  // Convert coaching slots to sessions (only if no sessions provided)
  const coachingSlotSessions: Session[] = useMemo(() => {
    return mockCoachingSlots
      .filter((slot) => slot.participants.includes(currentUser.name))
      .map((slot) => {
        const course = mockCourses.find((c) => c.id === slot.courseId);
        return {
          id: slot.id,
          courseId: slot.courseId,
          type: "coaching" as const,
          title: course ? `${course.title} Coaching` : "Coaching",
          program: course?.program || "DTI",
          date: slot.date,
          time: slot.time,
          endTime: slot.endTime,
          duration: slot.duration,
          location: "Online",
          locationType: "online",
          attendance: "optional" as const,
          objectives: [],
          materials: [],
          participants: slot.participants.length,
        };
      });
  }, []);

  // Combine all sessions (mock sessions + coaching slots) - only if no sessions provided
  const allSessions = useMemo(() => {
    return [...mockSessions, ...coachingSlotSessions];
  }, [coachingSlotSessions]);

  // Get upcoming sessions for the next 7 days
  const sessions = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    return allSessions
      .filter((session) => {
        const sessionDate = new Date(session.date);
        const sessionDateOnly = new Date(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate()
        );
        const nowDateOnly = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const sevenDaysDateOnly = new Date(
          sevenDaysFromNow.getFullYear(),
          sevenDaysFromNow.getMonth(),
          sevenDaysFromNow.getDate()
        );

        if (
          sessionDateOnly < nowDateOnly ||
          sessionDateOnly > sevenDaysDateOnly
        ) {
          return false;
        }

        if (sessionDateOnly.getTime() === nowDateOnly.getTime()) {
          const sessionEndTime = new Date(session.date);
          const [endHours, endMinutes] = session.endTime.split(":").map(Number);
          sessionEndTime.setHours(endHours, endMinutes, 0, 0);
          return sessionEndTime > now;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const [aHours, aMinutes] = a.time.split(":").map(Number);
        const [bHours, bMinutes] = b.time.split(":").map(Number);
        dateA.setHours(aHours, aMinutes, 0, 0);
        dateB.setHours(bHours, bMinutes, 0, 0);
        return dateA.getTime() - dateB.getTime();
      })
      .map((session) => {
        const sessionStartTime = new Date(session.date);
        const sessionEndTime = new Date(session.date);
        const [startHours, startMinutes] = session.time.split(":").map(Number);
        const [endHours, endMinutes] = session.endTime.split(":").map(Number);
        sessionStartTime.setHours(startHours, startMinutes, 0, 0);
        sessionEndTime.setHours(endHours, endMinutes, 0, 0);

        return {
          id: session.id,
          time: session.time,
          title: session.title,
          date: session.date,
          endTime: session.endTime,
          locationType: session.locationType,
          type:
            session.type === "lecture"
              ? "Vorlesung"
              : session.type === "workshop"
              ? "Workshop"
              : "Coaching",
          location:
            session.locationType === "online" ? "Online" : session.location,
          isLive: sessionStartTime <= now && sessionEndTime >= now,
          isPast: sessionEndTime < now,
        };
      });
  }, [allSessions]);
  // Group sessions by day
  const groupedByDay = sessions.reduce((acc, session) => {
    const dayKey = format(session.date, "yyyy-MM-dd");
    if (!acc[dayKey]) {
      acc[dayKey] = {
        date: session.date,
        sessions: [],
      };
    }
    acc[dayKey].sessions.push(session);
    return acc;
  }, {} as Record<string, { date: Date; sessions: typeof sessions }>);

  // Sort days chronologically
  const sortedDays = Object.values(groupedByDay).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Sort sessions within each day by time
  sortedDays.forEach((day) => {
    day.sessions.sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(":").map(Number);
      const [bHours, bMinutes] = b.time.split(":").map(Number);
      return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    });
  });

  const getDayLabel = (sessionDate: Date) => {
    if (isToday(sessionDate)) return "Heute";
    if (isTomorrow(sessionDate)) return "Morgen";
    if (isYesterday(sessionDate)) return "Gestern";
    return format(sessionDate, "EEEE, dd.MM", { locale: de });
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="!pb-0 !px-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-5 pt-3 sm:pt-4">
          <LoadingSkeletonNextUpList />
        </CardContent>
      </Card>
    );
  }

  const content = (
    <div className="p-0">
      {sortedDays.length === 0 ? (
        <div className="py-6 text-center text-[11px] sm:text-xs text-zinc-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDays.map((day, dayIndex) => (
            <div key={format(day.date, "yyyy-MM-dd")} className="relative">
              {/* Day header */}
              <div className="mb-2 sm:mb-3">
                <h4 className="text-xs sm:text-xs font-semibold text-zinc-900">
                  {getDayLabel(day.date)}
                </h4>
              </div>

              {/* Sessions for this day */}
              <div className="space-y-2 sm:space-y-3 relative">
                {/* Timeline line */}
                <div className="absolute left-[2.8rem] top-2 bottom-2 w-px bg-zinc-100"></div>

                {day.sessions.map((session, sessionIndex) => {
                  const isCoaching = session.type?.toLowerCase() === "coaching";
                  const dotColor = session.isPast
                    ? "bg-zinc-200 group-hover:bg-zinc-300 transition-colors"
                    : isCoaching
                    ? "bg-orange-500"
                    : "bg-[var(--primary)]";
                  const titleHoverColor = isCoaching
                    ? "group-hover:text-orange-500"
                    : "group-hover:text-[var(--primary)]";

                  return (
                    <div
                      key={session.id}
                      onClick={() => onSessionClick?.(session.id)}
                      // highlight coaching sessions in orange instead of default primary blue
                      className={`group hover:bg-zinc-50 p-2 rounded-md transition-colors duration-200 ease-in-out flex gap-3 items-start relative z-10 ${
                        onSessionClick ? "cursor-pointer" : "cursor-default"
                      } ${session.isPast ? "opacity-60" : ""}`}
                    >
                      <div className="w-8 text-[10px] font-medium text-zinc-400 pt-1 text-right tabular-nums">
                        {format(session.date, "dd.MM", { locale: de })}
                        <br />
                        <span className="text-[9px]">{session.time}</span>
                      </div>
                      <div
                        className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm mt-1 shrink-0 ${dotColor}`}
                      ></div>
                      <div
                        className={`flex-1 min-w-0 ${
                          sessionIndex < day.sessions.length - 1
                            ? "pb-3 border-b border-zinc-50"
                            : ""
                        }`}
                      >
                        <h4
                          className={`text-xs font-semibold text-zinc-900 transition-colors line-clamp-2 ${titleHoverColor}`}
                        >
                          {session.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {session.type} • {session.location}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!title) {
    return content;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="!pb-0 !px-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-5 pt-3 sm:pt-4">{content}</CardContent>
    </Card>
  );
};
