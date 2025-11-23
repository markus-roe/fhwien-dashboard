"use client";

import React, { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  X,
  Video,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isWithinInterval,
  isToday,
  isPast,
  isFuture,
  startOfDay,
} from "date-fns";
import { de } from "date-fns/locale";
import { getISOWeek } from "date-fns";
import type { Session } from "@/data/mockData";

interface CalendarViewProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
  onDateClick?: (date: Date) => void;
}

type ViewType = "month" | "week" | "day" | "list";

// Internal event format for calendar rendering
interface CalendarEvent {
  id: string;
  summary: string;
  startTime: Date;
  endTime: Date;
  session: Session;
}

// Helper to convert Session to CalendarEvent
const sessionToEvent = (session: Session): CalendarEvent => {
  const startTime = new Date(session.date);
  const [startHours, startMinutes] = session.time.split(":").map(Number);
  startTime.setHours(startHours, startMinutes, 0, 0);

  const endTime = new Date(session.date);
  const [endHours, endMinutes] = session.endTime.split(":").map(Number);
  endTime.setHours(endHours, endMinutes, 0, 0);

  return {
    id: session.id,
    summary: session.title,
    startTime,
    endTime,
    session,
  };
};

// Helper to get color for a session
const getSessionColor = (session: Session): string => {
  // Color by session type
  if (session.type === "lecture") return "#3b82f6"; // blue
  if (session.type === "workshop") return "#10b981"; // green
  if (session.type === "coaching") return "#f59e0b"; // amber
  return "#888"; // default gray
};

export function CalendarView({
  sessions,
  onSessionClick,
  onDateClick,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<
    CalendarEvent[] | null
  >(null);
  const [showPastSessions, setShowPastSessions] = useState(false);

  // Convert sessions to events
  const events = useMemo(() => {
    return sessions.map(sessionToEvent);
  }, [sessions]);

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

  const formatEventTime = (event: CalendarEvent) => {
    return `${format(event.startTime, "HH:mm", { locale: de })} - ${format(
      event.endTime,
      "HH:mm",
      { locale: de }
    )}`;
  };

  const getEventDuration = (event: CalendarEvent) => {
    return (
      (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60)
    ); // hours
  };

  const handleDayMoreClick = (day: Date, events: CalendarEvent[]) => {
    setSelectedDayEvents(events);
    setSelectedEvent(null);
    setShowEventDialog(true);
  };

  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
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

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    // Build days array
    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    // Ensure 6 weeks (42 days)
    while (days.length < 42) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="grid grid-cols-[2rem_repeat(7,1fr)] sm:grid-cols-[3rem_repeat(7,1fr)] grid-rows-6 h-full min-h-0">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {weekIndex === 0 && (
              <>
                <div
                  className="w-8 sm:w-12 p-0.5 sm:p-2 h-full text-center text-[10px] font-bold text-blue-700 bg-blue-50 flex flex-col items-center border-l border-t border-gray-150 border-b border-gray-150 cursor-pointer hover:bg-blue-100"
                  onClick={() => {
                    setViewType("week");
                    setCurrentDate(week[0]);
                  }}
                >
                  <span>{getISOWeek(week[0])}</span>
                </div>
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="p-0.5 sm:p-2 min-h-[80px] sm:h-full text-center min-w-0 bg-white border-l border-t border-gray-150 border-gray-150 flex flex-col"
                  >
                    <div className="text-[10px] sm:text-sm text-gray-500 font-medium">
                      {format(day, "EEE", { locale: de })}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {format(day, "d")}
                    </div>
                    <div className="flex flex-col gap-0.5 overflow-hidden max-h-[60px] sm:max-h-[90px]">
                      {visibleEvents
                        .filter((event) => isSameDay(event.startTime, day))
                        .slice(0, 3)
                        .map((event) => (
                          <div
                            key={event.id}
                            className="text-[10px] sm:text-xs p-0.5 sm:p-1 rounded truncate cursor-pointer hover:opacity-80 overflow-hidden whitespace-nowrap text-ellipsis"
                            style={{
                              backgroundColor: getSessionColor(event.session),
                              color: "white",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSessionClick(event.session);
                            }}
                          >
                            {event.summary}
                          </div>
                        ))}
                      {visibleEvents.filter((event) =>
                        isSameDay(event.startTime, day)
                      ).length > 3 && (
                        <div
                          className="text-[10px] sm:text-xs text-gray-500 cursor-pointer hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDayMoreClick(
                              day,
                              visibleEvents.filter((event) =>
                                isSameDay(event.startTime, day)
                              )
                            );
                          }}
                        >
                          +
                          {visibleEvents.filter((event) =>
                            isSameDay(event.startTime, day)
                          ).length - 3}{" "}
                          mehr
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            {weekIndex > 0 && (
              <React.Fragment key={weekIndex}>
                <div
                  className={`w-8 sm:w-12 pt-1 h-full text-center text-[10px] font-bold text-blue-700 bg-blue-50 flex flex-col items-center border-l border-t border-gray-150 cursor-pointer hover:bg-blue-100${
                    weekIndex === 0 ? " border-b border-gray-150" : ""
                  }`}
                  onClick={() => {
                    setViewType("week");
                    setCurrentDate(week[0]);
                  }}
                >
                  <span>{getISOWeek(week[0])}</span>
                </div>
                {week.map((day, dayIndex) => {
                  const dayEvents = visibleEvents.filter((event) => {
                    return isSameDay(event.startTime, day);
                  });
                  const maxEvents = 3;
                  const borderTop = weekIndex > 0 ? "border-t" : "";
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`min-w-0 min-h-[80px] sm:h-full px-0.5 sm:px-1 py-0.5 border-l ${borderTop} border-gray-150 cursor-pointer hover:bg-gray-50 flex flex-col ${
                        !isSameMonth(day, currentDate)
                          ? "text-gray-400 bg-gray-50"
                          : ""
                      } ${
                        isSameDay(day, new Date())
                          ? "bg-blue-50 "
                          : "border-t border-gray-150"
                      }`}
                    >
                      <div className="flex items-center justify-center mb-0.5 sm:mb-1">
                        <span
                          className={`text-xs sm:text-sm font-medium cursor-pointer ${
                            isSameDay(day, new Date()) ? "text-blue-600" : ""
                          } hover:underline`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewType("day");
                            setCurrentDate(day);
                            if (onDateClick) onDateClick(day);
                          }}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1 flex-1 overflow-hidden max-h-[60px] sm:max-h-[90px]">
                        {dayEvents.slice(0, maxEvents).map((event) => {
                          return (
                            <div
                              key={event.id}
                              className="text-[10px] sm:text-xs p-0.5 sm:p-1 rounded truncate cursor-pointer hover:opacity-80 overflow-hidden whitespace-nowrap text-ellipsis"
                              style={{
                                backgroundColor: getSessionColor(event.session),
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSessionClick(event.session);
                              }}
                            >
                              {event.summary}
                            </div>
                          );
                        })}
                        {dayEvents.length > maxEvents && (
                          <div
                            className="text-[10px] sm:text-xs text-gray-500 cursor-pointer hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDayMoreClick(day, dayEvents);
                            }}
                          >
                            +{dayEvents.length - maxEvents} mehr
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourHeight = 42; // px (desktop)
    const dayColumnHeight = 24 * hourHeight; // 1008px (desktop)

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="overflow-x-auto flex-shrink-0">
          <div className="min-w-[320px] sm:min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-[2rem_repeat(7,1fr)] sm:grid-cols-[3rem_repeat(7,1fr)] border-t border-gray-150 sticky top-0 bg-white z-10">
              <div className="w-8 sm:w-12"></div>
              {weekDays.map((day, i) => (
                <div
                  key={day.toISOString()}
                  className={`p-0.5 sm:p-2 text-center min-w-0`}
                  style={{ borderLeft: "1px solid #e5e7eb" }}
                >
                  <div className="text-[10px] sm:text-sm text-gray-500 font-medium">
                    {format(day, "EEE", { locale: de })}
                  </div>
                  <div
                    className={`text-xs sm:text-sm text-gray-600 ${
                      isSameDay(day, new Date()) ? "text-blue-600 font-bold" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          <div className="overflow-x-auto h-full">
            <div className="min-w-[320px] sm:min-w-[800px] h-full min-h-0">
              <div className="grid grid-cols-[2rem_repeat(7,1fr)] sm:grid-cols-[3rem_repeat(7,1fr)] h-full min-h-0">
            {/* Time labels */}
            <div className="relative w-8 sm:w-12 h-full min-h-0">
              {/* Mobile: Compact height */}
              <div className="block sm:hidden">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    style={{
                      height: 24,
                      top: hour * 24,
                      position: "absolute",
                      left: 0,
                      right: 0,
                    }}
                    className="text-right text-[8px] text-gray-500 border-b border-gray-50 pr-1 flex items-start justify-end"
                  >
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                ))}
              </div>
              {/* Desktop: Full height */}
              <div className="hidden sm:block">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    style={{
                      height: hourHeight,
                      top: hour * hourHeight,
                      position: "absolute",
                      left: 0,
                      right: 0,
                    }}
                    className="text-right text-sm text-gray-500 border-b border-gray-50 pr-2 flex items-start justify-end"
                  >
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                ))}
              </div>
            </div>
            {/* Day columns */}
            {weekDays.map((day, i) => {
              const dayEvents = visibleEvents.filter((event) =>
                isSameDay(event.startTime, day)
              );
              return (
                <div
                  key={day.toISOString()}
                  className="relative min-w-0 bg-white h-full min-h-0"
                  style={{
                    borderLeft: "1px solid #e5e7eb",
                  }}
                >
                  {/* Hour grid lines as background */}
                  <div className="block sm:hidden">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        style={{
                          position: "absolute",
                          top: hour * 24,
                          left: 0,
                          right: 0,
                          height: 0,
                          borderBottom: "1px solid #e5e7eb",
                          zIndex: 0,
                        }}
                      />
                    ))}
                  </div>
                  <div className="hidden sm:block">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        style={{
                          position: "absolute",
                          top: hour * hourHeight,
                          left: 0,
                          right: 0,
                          height: 0,
                          borderBottom: "1px solid #e5e7eb",
                          zIndex: 0,
                        }}
                      />
                    ))}
                  </div>
                  {/* Events absolutely positioned */}
                  {dayEvents.map((event) => {
                    const start = event.startTime;
                    const end = event.endTime;
                    const startMinutes =
                      start.getHours() * 60 + start.getMinutes();
                    const endMinutes = end.getHours() * 60 + end.getMinutes();

                    // Calculate mobile dimensions based on container height
                    const containerHeight = 576; // Base mobile height
                    const mobileTop = (startMinutes / (24 * 60)) * containerHeight;
                    const mobileHeight = Math.max(
                      24,
                      ((endMinutes - startMinutes) / (24 * 60)) * containerHeight
                    );

                    const desktopTop =
                      (startMinutes / (24 * 60)) * dayColumnHeight;
                    const desktopHeight = Math.max(
                      24,
                      ((endMinutes - startMinutes) / (24 * 60)) *
                        dayColumnHeight
                    );

                    return (
                      <>
                        {/* Mobile event */}
                        <div
                          key={`${event.id}-mobile`}
                          className="absolute left-0 right-0 rounded text-white text-[8px] p-0.5 shadow cursor-pointer overflow-hidden sm:hidden"
                          style={{
                            top: mobileTop,
                            height: mobileHeight,
                            zIndex: 1,
                            backgroundColor: getSessionColor(event.session),
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSessionClick(event.session);
                          }}
                        >
                          <div className="font-medium truncate">
                            {event.summary}
                          </div>
                          <div className="opacity-80 text-[6px]">
                            {formatEventTime(event)}
                          </div>
                        </div>
                        {/* Desktop event */}
                        <div
                          key={`${event.id}-desktop`}
                          className="absolute left-1 right-1 rounded text-white text-xs p-1 shadow cursor-pointer overflow-hidden hidden sm:block"
                          style={{
                            top: desktopTop,
                            height: desktopHeight,
                            zIndex: 1,
                            backgroundColor: getSessionColor(event.session),
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSessionClick(event.session);
                          }}
                        >
                          <div className="font-medium truncate">
                            {event.summary}
                          </div>
                          <div className="opacity-80 text-xs">
                            {formatEventTime(event)}
                          </div>
                        </div>
                      </>
                    );
                  })}
                </div>
              );
            })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = visibleEvents.filter((event) =>
      isSameDay(event.startTime, currentDate)
    );
    const hourHeight = 42; // px (desktop)
    const dayColumnHeight = 24 * hourHeight; // 1008px (desktop)

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header row for day view */}
        <div className="grid grid-cols-[2rem_1fr] sm:grid-cols-[3rem_1fr] border-t border-gray-150 sticky top-0 bg-white z-10 flex-shrink-0">
          <div className="w-8 sm:w-12 border-r border-gray-150"></div>
          <div className="p-0.5 sm:p-2 text-center min-w-0 text-[10px] sm:text-sm font-medium text-gray-500 flex flex-col items-center justify-center">
            <div className="text-[10px] sm:text-sm font-medium">
              {format(currentDate, "EEEE", { locale: de })}
            </div>
            <div className="text-xs sm:text-sm font-bold text-gray-600">
              {format(currentDate, "d. MMMM yyyy", { locale: de })}
            </div>
          </div>
        </div>
        <div className="flex flex-1 overflow-auto min-h-0">
          {/* Hour labels */}
          <div className="flex flex-col w-8 sm:w-12 text-right text-xs sm:text-sm text-gray-500 border-r relative h-full min-h-0">
            <div className="block sm:hidden">
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    height: 24,
                    position: "absolute",
                    top: hour * 24,
                    left: 0,
                    right: 0,
                  }}
                  className="pr-1 border-b border-gray-50 w-full text-[8px] flex items-start justify-end"
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>
            <div className="hidden sm:block">
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    height: hourHeight,
                    position: "absolute",
                    top: hour * hourHeight,
                    left: 0,
                    right: 0,
                  }}
                  className="pr-2 border-b border-gray-50 w-full flex items-start justify-end"
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>
          {/* Day event area */}
          <div className="flex-1 relative bg-white min-w-0 overflow-visible h-full min-h-0">
            {/* Hour grid lines */}
            <div className="block sm:hidden">
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    position: "absolute",
                    top: hour * 24,
                    left: 0,
                    right: 0,
                    height: 0,
                    borderBottom: "1px solid #e5e7eb",
                    zIndex: 0,
                  }}
                />
              ))}
            </div>
            <div className="hidden sm:block">
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    position: "absolute",
                    top: hour * hourHeight,
                    left: 0,
                    right: 0,
                    height: 0,
                    borderBottom: "1px solid #e5e7eb",
                    zIndex: 0,
                  }}
                />
              ))}
            </div>
            {/* Events absolutely positioned */}
            {dayEvents.map((event) => {
              const start = event.startTime;
              const end = event.endTime;
              const startMinutes = start.getHours() * 60 + start.getMinutes();
              const endMinutes = end.getHours() * 60 + end.getMinutes();

              // Calculate mobile dimensions based on container height
              const containerHeight = 576; // Base mobile height
              const mobileTop = (startMinutes / (24 * 60)) * containerHeight;
              const mobileHeight = Math.max(
                24,
                ((endMinutes - startMinutes) / (24 * 60)) * containerHeight
              );

              const desktopTop = (startMinutes / (24 * 60)) * dayColumnHeight;
              const desktopHeight = Math.max(
                24,
                ((endMinutes - startMinutes) / (24 * 60)) * dayColumnHeight
              );

              return (
                <>
                  {/* Mobile event */}
                  <div
                    key={`${event.id}-mobile`}
                    className="absolute left-0 right-0 rounded text-white text-[8px] p-0.5 shadow cursor-pointer overflow-hidden sm:hidden"
                    style={{
                      top: mobileTop,
                      height: mobileHeight,
                      zIndex: 1,
                      backgroundColor: getSessionColor(event.session),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSessionClick(event.session);
                    }}
                  >
                    <div className="font-medium truncate">{event.summary}</div>
                    <div className="opacity-80 text-[6px]">
                      {formatEventTime(event)}
                    </div>
                  </div>
                  {/* Desktop event */}
                  <div
                    key={`${event.id}-desktop`}
                    className="absolute left-1 right-1 rounded text-white text-xs p-1 shadow cursor-pointer overflow-hidden hidden sm:block"
                    style={{
                      top: desktopTop,
                      height: desktopHeight,
                      zIndex: 1,
                      backgroundColor: getSessionColor(event.session),
                    }}
                    onClick={() => onSessionClick(event.session)}
                  >
                    <div className="font-medium truncate">{event.summary}</div>
                    <div className="opacity-80 text-xs">
                      {formatEventTime(event)}
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => {
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
            {Array.from(sessionsByDate.entries()).map(([dateKey, daySessions]) => {
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
                      const [hours, minutes] = session.time.split(":").map(Number);
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
                                    (now.getTime() - sessionDateTime.getTime()) /
                                      (1000 * 60)
                                  )}{" "}
                                  minuten
                                </span>
                              )}
                            </div>

                            {/* Session Info */}
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSessionClick(session)}>
                              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-wide ${
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
                                      <span className="text-[10px] text-zinc-500">
                                        • Pflicht
                                      </span>
                                    )}
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
                                <button
                            
                                  className="flex-shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors sm:mt-0 mt-2 sm:w-auto w-full"
                                >
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
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Navigation */}
      <Card className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        <CardHeader className="pb-1 sm:pb-2 shrink-0">
          {/* Mobile: alles in eine Zeile */}
          <div className="flex flex-col sm:block">
            {/* Mobile: navigation row */}
            <div className="flex items-center justify-between gap-1 w-full sm:hidden">
              {/* Left: arrows + Heute */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {viewType !== "list" && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => navigateDate("prev")}
                      className="bg-transparent w-8 h-8 p-0 flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigateDate("next")}
                      className="bg-transparent w-8 h-8 p-0 flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={goToToday}
                      className="bg-transparent w-8 h-8 p-0 flex items-center justify-center"
                      title="Heute"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              {/* Right: M/W/T/L button group */}
              <div className="flex rounded-lg overflow-hidden border bg-gray-100 flex-shrink-0">
                {[
                  {
                    type: "month" as ViewType,
                    label: "Monat",
                    mobileLabel: "M",
                  },
                  {
                    type: "week" as ViewType,
                    label: "Woche",
                    mobileLabel: "W",
                  },
                  { type: "day" as ViewType, label: "Tag", mobileLabel: "T" },
                  { type: "list" as ViewType, label: "Terminübersicht", mobileLabel: "L" },
                ].map(({ type, mobileLabel }, idx, arr) => (
                  <Button
                    key={type}
                    variant={viewType === type ? "primary" : "ghost"}
                    onClick={() => setViewType(type)}
                    className={`border-0 rounded-none flex items-center justify-center ${
                      idx === 0 ? "rounded-l-lg" : ""
                    } ${idx === arr.length - 1 ? "rounded-r-lg" : ""} ${
                      viewType === type ? "" : "bg-transparent hover:bg-white"
                    } ${idx > 0 ? "-ml-px" : ""} w-8 h-8 p-0 text-xs`}
                  >
                    {mobileLabel}
                  </Button>
                ))}
              </div>
            </div>
            {/* Desktop: 3-Spalten-Grid */}
            <div className={`hidden sm:grid sm:items-center sm:gap-2 w-full ${
              viewType === "list" ? "sm:grid-cols-[1fr_auto]" : "sm:grid-cols-[1fr_auto_1fr]"
            }`}>
              {/* Links: Navigation + Heute */}
              {viewType !== "list" && (
                <div className="flex items-center gap-2 justify-start">
                  <Button
                    variant="ghost"
                    onClick={() => navigateDate("prev")}
                    className="bg-transparent p-2 sm:p-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigateDate("next")}
                    className="bg-transparent p-2 sm:p-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={goToToday}
                    className="bg-transparent text-xs sm:text-sm"
                  >
                    Heute
                  </Button>
                </div>
              )}
              {/* Mitte: Titel zentriert */}
              <div className={`flex justify-center ${viewType === "list" ? "col-start-1" : ""}`}>
                <h3 className="text-base sm:text-xl font-semibold text-center">
                  {getDateTitle()}
                </h3>
              </div>
              {/* Rechts: Ansichtsauswahl */}
              <div className="flex items-center gap-2 justify-end">
                <div className="flex rounded-lg overflow-hidden border bg-gray-100">
                  {[
                    {
                      type: "month" as ViewType,
                      label: "Monat",
                      mobileLabel: "M",
                    },
                    {
                      type: "week" as ViewType,
                      label: "Woche",
                      mobileLabel: "W",
                    },
                    { type: "day" as ViewType, label: "Tag", mobileLabel: "T" },
                    { type: "list" as ViewType, label: "Terminübersicht", mobileLabel: "L" },
                  ].map(({ type, label }, idx, arr) => (
                    <Button
                      key={type}
                      variant={viewType === type ? "primary" : "ghost"}
                      onClick={() => setViewType(type)}
                      className={`text-sm px-3 py-1 border-0 rounded-none ${
                        idx === 0 ? "rounded-l-lg" : ""
                      } ${idx === arr.length - 1 ? "rounded-r-lg" : ""} ${
                        viewType === type ? "" : "bg-transparent hover:bg-white"
                      } ${idx > 0 ? "-ml-px" : ""}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-1 sm:p-2 flex-1 min-h-0 flex flex-col overflow-hidden">
          {viewType === "month" && (
            <div className="flex-1 min-h-0 overflow-auto sm:overflow-hidden flex flex-col">
              {renderMonthView()}
            </div>
          )}
          {viewType === "week" && (
            <div className="flex-1 min-h-0 overflow-hidden">
              {renderWeekView()}
            </div>
          )}
          {viewType === "day" && (
            <div className="flex-1 min-h-0 overflow-hidden">
              {renderDayView()}
            </div>
          )}
          {viewType === "list" && (
            <div className="flex-1 h-full min-h-0 overflow-hidden">
              {renderListView()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md mx-2 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Termin Details
            </DialogTitle>
            <button
              onClick={() => setShowEventDialog(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 py-4 px-4 sm:px-6">
              <div>
                <h4 className="font-semibold text-lg">
                  {selectedEvent.summary}
                </h4>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  {format(selectedEvent.startTime, "EEEE, d. MMMM yyyy", {
                    locale: de,
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Zeit:</span>
                  <span className="ml-1 font-medium">
                    {formatEventTime(selectedEvent)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Dauer:</span>
                  <span className="ml-1 font-medium">
                    {getEventDuration(selectedEvent).toFixed(1)}h
                  </span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getSessionColor(selectedEvent.session),
                    }}
                  />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    Typ:{" "}
                    {selectedEvent.session.type === "lecture"
                      ? "Vorlesung"
                      : selectedEvent.session.type === "workshop"
                      ? "Workshop"
                      : "Coaching"}
                  </div>
                  <div>Ort: {selectedEvent.session.location}</div>
                  <div>
                    Teilnahme:{" "}
                    {selectedEvent.session.attendance === "mandatory"
                      ? "Pflicht"
                      : "Optional"}
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedDayEvents && (
            <div className="space-y-4 py-4 px-4 sm:px-6">
              <h4 className="font-semibold text-lg mb-2">
                Alle Termine an diesem Tag
              </h4>
              <div className="space-y-2">
                {selectedDayEvents.map((ev: CalendarEvent) => (
                  <div
                    key={ev.id}
                    className="p-2 rounded bg-gray-100 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setSelectedEvent(ev);
                      setSelectedDayEvents(null);
                    }}
                  >
                    <div className="font-medium text-sm truncate">
                      {ev.summary}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatEventTime(ev)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
