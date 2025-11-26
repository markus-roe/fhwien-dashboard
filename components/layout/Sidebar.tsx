import { useMemo, useState, useCallback, type MouseEvent } from "react";
import type { Session } from "@/data/mockData";
import { SmallCalendar } from "@/components/groups/SmallCalendar";
import { NextUpList } from "@/components/schedule/NextUpList";
import { NextUpCard } from "@/components/schedule/NextUpCard";
import { EventPopover } from "@/components/schedule/EventPopover";
import { sessionToEvent } from "@/components/schedule/utils/calendarHelpers";
import type { CalendarEvent } from "@/components/schedule/types/calendar";
import {
  mockSessions,
  mockCoachingSlots,
  mockCourses,
  currentUser,
} from "@/data/mockData";

type SidebarProps = {
  showCalendar?: boolean;
  showNextUpCard?: boolean;
  onSessionClick?: (session: Session) => void;
  emptyMessage?: string;
};

export function Sidebar({
  showCalendar = true,
  showNextUpCard = false,
  onSessionClick,
  emptyMessage,
}: SidebarProps) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<
    CalendarEvent[] | null
  >(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showEventPopover, setShowEventPopover] = useState(false);

  // Convert coaching slots to sessions for calendar
  const slotSessions: Session[] = useMemo(() => {
    return mockCoachingSlots
      .filter((slot) => slot.participants.some((p) => p === currentUser.name))
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

  // Combine all sessions (mock sessions + coaching slots + additional sessions)
  const combinedSessions = useMemo(() => {
    return [...mockSessions, ...slotSessions];
  }, [slotSessions]);

  // Get next up session for NextUpCard
  const nextUpSession = useMemo(() => {
    if (!showNextUpCard) return null;

    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    const upcoming = combinedSessions
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
      });

    if (upcoming.length === 0) return null;

    const session = upcoming[0];
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
      location: session.locationType === "online" ? "Online" : session.location,
      isLive: sessionStartTime <= now && sessionEndTime >= now,
      isPast: sessionEndTime < now,
    };
  }, [combinedSessions, showNextUpCard]);

  const handleClosePopover = useCallback(() => {
    setShowEventPopover(false);
    setSelectedDayEvents(null);
    setPopoverPosition(null);
  }, []);

  const handleCalendarDayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>, dayAppointments: Session[]) => {
      if (dayAppointments.length === 0) return;
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;
      const isMobile = window.innerWidth < 640;
      const popoverWidth = isMobile ? 260 : 280;
      const popoverHeight = 320;
      let top = rect.bottom + scrollTop + 4;
      let left = rect.left + scrollLeft;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 8;

      if (isMobile) {
        left = Math.max(
          padding,
          Math.min(left, viewportWidth - popoverWidth - padding)
        );
      } else {
        if (left + popoverWidth > viewportWidth - padding) {
          left = viewportWidth - popoverWidth - padding;
        }
        if (left < padding) {
          left = padding;
        }
      }

      if (top + popoverHeight > scrollTop + viewportHeight - padding) {
        top = rect.top + scrollTop - popoverHeight - 4;
        if (top < scrollTop + padding) {
          top = scrollTop + padding;
        }
      }

      setSelectedDayEvents(dayAppointments.map(sessionToEvent));
      setPopoverPosition({ top, left });
      setShowEventPopover(true);
    },
    []
  );

  const handleDateChange = useCallback((date: Date) => {
    setCalendarDate(date);
  }, []);

  const handleSessionClick = useCallback(
    (sessionId: string) => {
      // Find session in combined sessions
      const session = combinedSessions.find((s) => s.id === sessionId);
      if (session) {
        onSessionClick?.(session);
      }
    },
    [combinedSessions, onSessionClick]
  );

  const handleNextUpCardClick = useCallback(() => {
    if (nextUpSession) {
      const session = combinedSessions.find((s) => s.id === nextUpSession.id);
      if (session) {
        onSessionClick?.(session);
      }
    }
  }, [nextUpSession, combinedSessions, onSessionClick]);

  return (
    <>
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col gap-3">
          {showNextUpCard && nextUpSession && (
            <NextUpCard
              session={nextUpSession}
              onOpenPanel={handleNextUpCardClick}
            />
          )}
          {showCalendar && (
            <div className="w-full">
              <SmallCalendar
                allSessions={combinedSessions}
                onDayClick={handleCalendarDayClick}
                date={calendarDate}
                onDateChange={handleDateChange}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <NextUpList
              emptyMessage={emptyMessage}
              onSessionClick={handleSessionClick}
            />
          </div>
        </div>
      </div>

      {showEventPopover && popoverPosition && selectedDayEvents && (
        <EventPopover
          events={selectedDayEvents}
          position={popoverPosition}
          onClose={handleClosePopover}
          onSessionClick={(session) => {
            const foundSession = combinedSessions.find(
              (s) => s.id === session.id
            );
            if (foundSession) {
              onSessionClick?.(foundSession);
            }
            handleClosePopover();
          }}
        />
      )}
    </>
  );
}
