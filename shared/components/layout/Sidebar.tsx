import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  type MouseEvent,
} from "react";
import type { Session } from "@/shared/data/mockData";
import { SmallCalendar } from "@/features/groups/components/SmallCalendar";
import { NextUpList } from "@/features/schedule/components/NextUpList";
import { NextUpCard } from "@/features/schedule/components/NextUpCard";
import { EventPopover } from "@/features/schedule/components/EventPopover";
import { sessionToEvent } from "@/features/schedule/utils/calendarHelpers";
import type { CalendarEvent } from "@/features/schedule/types/calendar";
import { currentUser } from "@/shared/data/mockData";
import { useSessions } from "@/features/sessions/hooks/useSessions";
import { useCoachingSlots } from "@/features/coaching/hooks/useCoachingSlots";
import { useCourses } from "@/shared/hooks/useCourses";
import { LoadingSkeletonSmallCalendar } from "@/shared/components/ui/LoadingSkeleton";

const STORAGE_KEY = "schedule-visible-course-ids";

type SidebarProps = {
  onSessionClick?: (session: Session) => void;
  emptyMessage?: string;
  onVisibleCourseIdsChange?: (visibleCourseIds: Set<string>) => void;
  showCourseFilterButtons?: boolean;
};

export function Sidebar({
  onSessionClick,
  emptyMessage,
  onVisibleCourseIdsChange,
  showCourseFilterButtons = false,
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
  const { sessions: mockSessions, loading: sessionsLoading } = useSessions();
  const { slots: coachingSlots, loading: slotsLoading } = useCoachingSlots();
  const { courses: mockCourses, loading: coursesLoading } = useCourses();

  const isLoading = sessionsLoading || slotsLoading || coursesLoading;

  // Get all course IDs for current user's program
  const allCourseIds = useMemo(() => {
    return mockCourses
      .filter((course) => course.program.includes(currentUser.program))
      .map((course) => course.id);
  }, [mockCourses]);

  // Initialize visibleCourseIds from localStorage or default to all courses
  const [visibleCourseIds, setVisibleCourseIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return new Set(parsed);
      }
    } catch (error) {
      console.error(
        "Failed to load visible course IDs from localStorage:",
        error
      );
    }

    return new Set();
  });

  // Update visibleCourseIds when courses are loaded
  useEffect(() => {
    if (allCourseIds.length > 0 && !coursesLoading) {
      setVisibleCourseIds((prev) => {
        // If visibleCourseIds is empty, initialize with all course IDs
        if (prev.size === 0) {
          const newSet = new Set(allCourseIds);
          // Save to localStorage
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(Array.from(newSet))
            );
          } catch (error) {
            console.error(
              "Failed to save visible course IDs to localStorage:",
              error
            );
          }
          return newSet;
        } else {
          // Merge with new course IDs (in case new courses were added)
          const newSet = new Set(prev);
          let hasChanges = false;
          allCourseIds.forEach((id) => {
            if (!newSet.has(id)) {
              newSet.add(id);
              hasChanges = true;
            }
          });
          // Remove course IDs that no longer exist
          Array.from(newSet).forEach((id) => {
            if (!allCourseIds.includes(id)) {
              newSet.delete(id);
              hasChanges = true;
            }
          });
          if (hasChanges) {
            try {
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(Array.from(newSet))
              );
            } catch (error) {
              console.error(
                "Failed to save visible course IDs to localStorage:",
                error
              );
            }
            return newSet;
          }
          return prev;
        }
      });
    }
  }, [allCourseIds, coursesLoading]);

  // Notify parent when visibleCourseIds changes
  useEffect(() => {
    onVisibleCourseIdsChange?.(visibleCourseIds);
  }, [visibleCourseIds, onVisibleCourseIdsChange]);

  const handleCourseVisibilityChange = useCallback(
    (courseId: string, visible: boolean) => {
      setVisibleCourseIds((prev) => {
        const next = new Set(prev);
        if (visible) {
          next.add(courseId);
        } else {
          next.delete(courseId);
        }
        // Save to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
        } catch (error) {
          console.error(
            "Failed to save visible course IDs to localStorage:",
            error
          );
        }
        return next;
      });
    },
    []
  );

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
  // Filter by visible courses
  const combinedSessions = useMemo(() => {
    return allSessionsUnfiltered.filter(
      (session) => !session.courseId || visibleCourseIds.has(session.courseId)
    );
  }, [allSessionsUnfiltered, visibleCourseIds]);

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

  return (
    <>
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col gap-3">
          <div className="w-full">
            {isLoading ? (
              <LoadingSkeletonSmallCalendar
                showCourseFilterButtons={showCourseFilterButtons}
              />
            ) : (
              <SmallCalendar
                allSessions={combinedSessions}
                onDayClick={handleCalendarDayClick}
                date={calendarDate}
                onDateChange={handleDateChange}
                footerContent={
                  showCourseFilterButtons && availableCourses.length > 0 ? (
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
                                  handleCourseVisibilityChange(
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
            )}
          </div>

          <div className="flex-1 min-w-0">
            <NextUpList
              title="Nächste 7 Tage"
              emptyMessage={emptyMessage}
              onSessionClick={handleSessionClick}
              loading={isLoading}
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
