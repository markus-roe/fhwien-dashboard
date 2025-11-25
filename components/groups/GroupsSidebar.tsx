import { useMemo, useState, useCallback } from "react";
import type { Course, Group } from "@/data/mockData";
import type { MouseEvent } from "react";
import type { Session } from "@/data/mockData";
import { MyGroupCard } from "./MyGroupCard";
import { EmptyGroupsState } from "./EmptyGroupsState";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { CreateGroupDialog, type CreateGroupFormData } from "./CreateGroupDialog";
import { SmallCalendar } from "./SmallCalendar";
import { mockSessions as allSessions } from "@/data/mockData";
import { NextUpList } from "../schedule/NextUpList";
import { EventPopover } from "../schedule/EventPopover";
import { sessionToEvent } from "@/components/schedule/utils/calendarHelpers";
import type { CalendarEvent } from "@/components/schedule/types/calendar";

type GroupsSidebarProps = {
  myGroups: Group[];
  courses: Course[];
  expandedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onLeaveGroup: (groupId: string) => void;
  onCreateGroup?: (data: CreateGroupFormData) => void;
  onSessionClick?: (session: Session) => void;
};

export function GroupsSidebar({
  myGroups,
  courses,
  expandedGroups,
  onToggleGroup,
  onLeaveGroup,
  onCreateGroup,
  onSessionClick,
}: GroupsSidebarProps) {
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[] | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showEventPopover, setShowEventPopover] = useState(false);
  

  // Group groups by course
  const groupedByCourse = useMemo(() => {
    return myGroups.reduce((acc, group) => {
      const courseId = group.courseId;
      if (!acc[courseId]) {
        acc[courseId] = {
          course: courses.find((c) => c.id === courseId),
          groups: [],
        };
      }
      acc[courseId].groups.push(group);
      return acc;
    }, {} as Record<string, { course?: Course; groups: Group[] }>);
  }, [myGroups, courses]);

  // Sort courses by title
  const sortedCourses = useMemo(() => {
    return Object.values(groupedByCourse).sort((a, b) => {
      const titleA = a.course?.title || "";
      const titleB = b.course?.title || "";
      return titleA.localeCompare(titleB);
    });
  }, [groupedByCourse]);

    // Get upcoming sessions for the next 7 days
    const upcomingSessions = useMemo(() => {
      const now = new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(now.getDate() + 7);
      sevenDaysFromNow.setHours(23, 59, 59, 999); // End of day 7
  
      return allSessions
        .filter((session) => {
          const sessionDate = new Date(session.date);
          // Normalize to compare only dates (ignore time)
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
  
          // Check if session is within the 7-day window
          if (sessionDateOnly < nowDateOnly || sessionDateOnly > sevenDaysDateOnly) {
            return false;
          }
  
          // For today's sessions, check if they haven't ended yet
          if (sessionDateOnly.getTime() === nowDateOnly.getTime()) {
            const sessionEndTime = new Date(session.date);
            const [endHours, endMinutes] = session.endTime.split(":").map(Number);
            sessionEndTime.setHours(endHours, endMinutes, 0, 0);
            // Only include if session hasn't ended yet
            return sessionEndTime > now;
          }
  
          // For future days, include all sessions
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
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
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
      const session = allSessions.find((s) => s.id === sessionId);
      if (session) {
        onSessionClick?.(session);
      }
    },
    [allSessions, onSessionClick]
  );

  return (
    <>
      <div className="flex-shrink-0 space-y-4">
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <SmallCalendar
              allSessions={allSessions}
              onDayClick={handleCalendarDayClick}
              date={calendarDate}
              onDateChange={handleDateChange}
            />
          </div>
          <div className="flex-1 min-w-0">
            <NextUpList
              sessions={upcomingSessions}
              emptyMessage="Noch keine Gruppentermine geplant."
              onSessionClick={handleSessionClick}
            />
          </div>
        </div>
      </div>

      {onCreateGroup && (
        <CreateGroupDialog
          isOpen={isCreateGroupDialogOpen}
          onOpenChange={setIsCreateGroupDialogOpen}
          courses={courses}
          defaultCourseId={null}
          onSubmit={(data) => {
            onCreateGroup(data);
            setIsCreateGroupDialogOpen(false);
          }}
        />
      )}

      {showEventPopover && popoverPosition && selectedDayEvents && (
        <EventPopover
          events={selectedDayEvents}
          position={popoverPosition}
          onClose={handleClosePopover}
          onSessionClick={(session) => {
            onSessionClick?.(session);
            handleClosePopover();
          }}
        />
      )}
    </>
  );
}

