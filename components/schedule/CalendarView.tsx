"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isWithinInterval,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  format,
} from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  currentUser,
  mockCoachingSlots,
  mockCourses,
  mockSessions,
  type Session,
} from "@/data/mockData";
import type { CalendarEvent, ViewType } from "./types/calendar";
import { sessionToEvent } from "./utils/calendarHelpers";
import { CalendarNavigation } from "./CalendarNavigation";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { CalendarListView } from "./CalendarListView";
import { EventPopover } from "./EventPopover";

interface CalendarViewProps {
  onSessionClick: (session: Session) => void;
  onDateClick?: (date: Date) => void;
  visibleCourseIds?: Set<string>;
}

export function CalendarView({
  onSessionClick,
  onDateClick,
  visibleCourseIds,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("month");
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<
    CalendarEvent[] | null
  >(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Convert coaching slots to sessions
  const coachingSlotSessions: Session[] = useMemo(() => {
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

  // Combine all sessions (mock sessions + coaching slots)
  const allSessions = useMemo(() => {
    const combined = [...mockSessions, ...coachingSlotSessions];
    // Filter by visible courses if filter is provided
    if (visibleCourseIds !== undefined) {
      return combined.filter((session) => 
        !session.courseId || visibleCourseIds.has(session.courseId)
      );
    }
    return combined;
  }, [coachingSlotSessions, visibleCourseIds]);

  // Convert sessions to events
  const events = useMemo(() => {
    return allSessions.map(sessionToEvent);
  }, [allSessions]);

  // Keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "m" || e.key === "M") setViewType("month");
      if (e.key === "w" || e.key === "W") setViewType("week");
      if (e.key === "d" || e.key === "D") setViewType("day");
      if (e.key === "l" || e.key === "L") setViewType("list");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Calculate visible date range based on current view and date
  const visibleDateRange = useMemo(() => {
    if (viewType === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return { startDate, endDate };
    } else if (viewType === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return { startDate: weekStart, endDate: weekEnd };
    } else {
      const dayStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const dayEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        23,
        59,
        59
      );
      return { startDate: dayStart, endDate: dayEnd };
    }
  }, [currentDate, viewType]);

  // Filter events for the visible range
  const visibleEvents = useMemo(() => {
    return events.filter((event) =>
      isWithinInterval(event.startTime, {
        start: visibleDateRange.startDate,
        end: visibleDateRange.endDate,
      })
    );
  }, [events, visibleDateRange]);

  const handleDayMoreClick = (
    day: Date,
    events: CalendarEvent[],
    event: React.MouseEvent<HTMLElement>
  ) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    // Calculate position - try to position below the cell, but adjust if needed
    const isMobile = window.innerWidth < 640; // sm breakpoint
    const popoverWidth = isMobile ? 260 : 280;
    const popoverHeight = 320; // max height of popover
    let top = rect.bottom + scrollTop + 4;
    let left = rect.left + scrollLeft;

    // Adjust if popover would go off screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    // Adjust horizontal position - center on mobile if needed
    if (isMobile) {
      // On mobile, try to center horizontally
      left = Math.max(
        padding,
        Math.min(left, viewportWidth - popoverWidth - padding)
      );
    } else {
      // On desktop, align to cell
      if (left + popoverWidth > viewportWidth - padding) {
        left = viewportWidth - popoverWidth - padding;
      }
      if (left < padding) {
        left = padding;
      }
    }

    // Adjust vertical position - if not enough space below, show above
    if (top + popoverHeight > scrollTop + viewportHeight - padding) {
      top = rect.top + scrollTop - popoverHeight - 4;
      // If still doesn't fit above, position at top of viewport
      if (top < scrollTop + padding) {
        top = scrollTop + padding;
      }
    }

    setSelectedDayEvents(events);
    setPopoverPosition({
      top,
      left,
    });
    setShowEventDialog(true);
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (viewType === "month") {
      setCurrentDate(
        direction === "next"
          ? addMonths(currentDate, 1)
          : subMonths(currentDate, 1)
      );
    } else if (viewType === "week") {
      setCurrentDate(
        direction === "next"
          ? addWeeks(currentDate, 1)
          : subWeeks(currentDate, 1)
      );
    } else {
      setCurrentDate(
        direction === "next"
          ? addDays(currentDate, 1)
          : addDays(currentDate, -1)
      );
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateTitle = () => {
    if (viewType === "month") {
      return format(currentDate, "MMMM yyyy", { locale: de });
    } else if (viewType === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(weekStart, "d. MMM", { locale: de })} - ${format(
        weekEnd,
        "d. MMM yyyy",
        { locale: de }
      )}`;
    } else if (viewType === "day") {
      return format(currentDate, "EEEE, d. MMMM yyyy", { locale: de });
    } else {
      return "Terminübersicht";
    }
  };

  const handleClosePopover = () => {
    setShowEventDialog(false);
    setPopoverPosition(null);
  };

  const handleWeekClick = (weekStart: Date) => {
    setViewType("week");
    setCurrentDate(weekStart);
  };

  const handleDayClick = (date: Date) => {
    setViewType("day");
    setCurrentDate(date);
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <Card className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        <CardHeader className="pb-1 sm:pb-2 shrink-0">
          <CalendarNavigation
            viewType={viewType}
            currentDate={currentDate}
            dateTitle={getDateTitle()}
            onViewChange={setViewType}
            onNavigateDate={navigateDate}
            onGoToToday={goToToday}
          />
        </CardHeader>
        <CardContent className="p-1 sm:p-2 flex-1 min-h-0 flex flex-col overflow-hidden">
          {viewType === "month" && (
            <div className="flex-1 min-h-0 overflow-auto sm:overflow-hidden flex flex-col">
              <MonthView
                currentDate={currentDate}
                events={visibleEvents}
                onSessionClick={onSessionClick}
                onDateClick={onDateClick}
                onDayClick={handleDayClick}
                onDayMoreClick={handleDayMoreClick}
                onWeekClick={handleWeekClick}
              />
            </div>
          )}
          {viewType === "week" && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <WeekView
                currentDate={currentDate}
                events={visibleEvents}
                onSessionClick={onSessionClick}
              />
            </div>
          )}
          {viewType === "day" && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <DayView
                currentDate={currentDate}
                events={visibleEvents}
                onSessionClick={onSessionClick}
              />
            </div>
          )}
          {viewType === "list" && (
            <div className="flex-1 h-full min-h-0 overflow-hidden">
              <CalendarListView
                sessions={allSessions}
                onSessionClick={onSessionClick}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Popover */}
      {showEventDialog && popoverPosition && selectedDayEvents && (
        <EventPopover
          events={selectedDayEvents}
          position={popoverPosition}
          onClose={handleClosePopover}
          onSessionClick={onSessionClick}
        />
      )}
    </div>
  );
}
