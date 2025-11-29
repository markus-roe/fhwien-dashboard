import { useMemo, useState, useCallback, type MouseEvent } from "react";
import type { Session } from "@/data/mockData";
import { SmallCalendar } from "@/components/groups/SmallCalendar";
import { NextUpList } from "@/components/schedule/NextUpList";
import { NextUpCard } from "@/components/schedule/NextUpCard";
import { EventPopover } from "@/components/schedule/EventPopover";
import { sessionToEvent } from "@/components/schedule/utils/calendarHelpers";
import type { CalendarEvent } from "@/components/schedule/types/calendar";
import { currentUser } from "@/data/mockData";
import { useSessions } from "@/hooks/useSessions";
import { useCoachingSlots } from "@/hooks/useCoachingSlots";
import { useCourses } from "@/hooks/useCourses";

type SidebarProps = {
  showCalendar?: boolean;
  showNextUpCard?: boolean;
  onSessionClick?: (session: Session) => void;
  emptyMessage?: string;
  visibleCourseIds?: Set<string>;
  onCourseVisibilityChange?: (courseId: string, visible: boolean) => void;
};

export function Sidebar({
  showCalendar = true,
  showNextUpCard = false,
  onSessionClick,
  emptyMessage,
  visibleCourseIds,
  onCourseVisibilityChange,
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

  // Fetch data using hooks
  const { sessions: mockSessions } = useSessions();
  const { slots: coachingSlots } = useCoachingSlots();
  const { courses: mockCourses } = useCourses();

  // Convert coaching slots to sessions for calendar
  const slotSessions: Session[] = useMemo(() => {
    return coachingSlots
      .filter((slot) => slot.participants.some((p) => p === currentUser.name))
      .map((slot) => {
        const course = mockCourses.find((c) => c.id === slot.courseId);
        return {
          id: slot.id,
          courseId: slot.courseId,
          type: "coaching" as const,
          title: course ? `${course.title} Coaching` : "Coaching",
          program: course?.program || ["DTI"],
          date: slot.date,
          time: slot.time,
          endTime: slot.endTime,
          duration: slot.duration,
          location: "Online",
          locationType: "online" as const,
          attendance: "optional" as const,
          objectives: [],
          materials: [],
          participants: slot.participants.length,
        };
      });
  }, [coachingSlots, mockCourses]);

  // Get all sessions (unfiltered) for computing available courses
  const allSessionsUnfiltered = useMemo(() => {
    return [...mockSessions, ...slotSessions];
  }, [mockSessions, slotSessions]);

  // Get all courses from mockData filtered by current user's program
  const availableCourses = useMemo(() => {
    return mockCourses
      .filter((course) => course.program.includes(currentUser.program))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [mockCourses]);

  // Combine all sessions (mock sessions + coaching slots + additional sessions)
  // Filter by visible courses if filter is provided
  const combinedSessions = useMemo(() => {
    // Filter by visible courses if filter is provided
    if (visibleCourseIds !== undefined) {
      return allSessionsUnfiltered.filter(
        (session) => !session.courseId || visibleCourseIds.has(session.courseId)
      );
    }
    return allSessionsUnfiltered;
  }, [allSessionsUnfiltered, visibleCourseIds]);

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
          {/* {showNextUpCard && nextUpSession && (
            <NextUpCard
              session={nextUpSession}
              onOpenPanel={handleNextUpCardClick}
            />
          )} */}
          {/* {showCalendar && ( */}
          <div className="w-full">
            <SmallCalendar
              allSessions={combinedSessions}
              onDayClick={handleCalendarDayClick}
              date={calendarDate}
              onDateChange={handleDateChange}
              footerContent={
                visibleCourseIds !== undefined &&
                availableCourses.length > 0 ? (
                  <div className="space-y-1.5">
                    {availableCourses.map((course) => {
                      const isVisible = visibleCourseIds.has(course.id);
                      const courseColor = "var(--primary)";
                      return (
                        <label
                          key={course.id}
                          className="flex items-center gap-2 cursor-pointer group py-1 select-none"
                        >
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={(e) => {
                                onCourseVisibilityChange?.(
                                  course.id,
                                  e.target.checked
                                );
                              }}
                              className="sr-only"
                            />
                            <div
                              className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                              style={{
                                borderColor: isVisible
                                  ? courseColor
                                  : "#d1d5db",
                                backgroundColor: isVisible
                                  ? courseColor
                                  : "transparent",
                              }}
                            >
                              {isVisible && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs font-medium text-zinc-900 truncate group-hover:text-blue-600 transition-colors">
                              {course.title}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : null
              }
            />
          </div>
          {/* )} */}

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
