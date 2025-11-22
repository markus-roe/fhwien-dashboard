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
} from "date-fns";
import { de } from "date-fns/locale";
import { getISOWeek } from "date-fns";
import type { Session } from "@/data/mockData";

interface CalendarViewProps {
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
  onDateClick?: (date: Date) => void;
}

type ViewType = "month" | "week" | "day";

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

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDayEvents(null);
    setShowEventDialog(true);
    onSessionClick?.(event.session);
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
    } else {
      return format(currentDate, "EEEE, d. MMMM yyyy", { locale: de });
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
      <div className="grid grid-cols-[2rem_repeat(7,1fr)] sm:grid-cols-[3rem_repeat(7,1fr)]">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {weekIndex === 0 && (
              <>
                <div
                  className="w-8 sm:w-12 p-0.5 sm:p-2 h-20 sm:h-28 md:h-32 text-center text-[10px] font-bold text-blue-700 bg-blue-50 flex flex-col items-center border-l border-t border-gray-150 border-b border-gray-150 cursor-pointer hover:bg-blue-100"
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
                    className="p-0.5 sm:p-2 h-20 sm:h-28 md:h-32 text-center min-w-0 bg-white border-l border-t border-gray-150 border-gray-150"
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
                              handleEventClick(event);
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
                  className={`w-8 sm:w-12 pt-1 text-center text-[10px] font-bold text-blue-700 bg-blue-50 flex flex-col items-center border-l border-t border-gray-150 cursor-pointer hover:bg-blue-100${
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
                      className={`min-w-0 h-20 sm:h-28 md:h-32 px-0.5 sm:px-1 py-0.5 border-l ${borderTop} border-gray-150 cursor-pointer hover:bg-gray-50 flex flex-col ${
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
                                handleEventClick(event);
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
      <div className="overflow-x-auto">
        <div className="min-w-[320px] sm:min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-[2rem_repeat(7,1fr)] sm:grid-cols-[3rem_repeat(7,1fr)] border-t border-gray-150">
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

          <div className="grid grid-cols-[2rem_repeat(7,1fr)] sm:grid-cols-[3rem_repeat(7,1fr)]">
            {/* Time labels */}
            <div className="relative h-[576px] sm:h-[1008px] w-8 sm:w-12">
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
                  className={`relative min-w-0 bg-white h-[576px] sm:h-[1008px]`}
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

                    const mobileTop = (startMinutes / (24 * 60)) * 576;
                    const mobileHeight = Math.max(
                      24,
                      ((endMinutes - startMinutes) / (24 * 60)) * 576
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
                            handleEventClick(event);
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
                            handleEventClick(event);
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
      <div>
        {/* Header row for day view */}
        <div className="grid grid-cols-[2rem_1fr] sm:grid-cols-[3rem_1fr] border-t border-gray-150">
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
        <div className="flex overflow-visible">
          {/* Hour labels */}
          <div className="flex flex-col w-8 sm:w-12 text-right text-xs sm:text-sm text-gray-500 border-r relative h-[576px] sm:h-[1008px]">
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
          <div className="flex-1 relative bg-white min-w-0 h-[576px] sm:h-[1008px] overflow-visible">
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

              const mobileTop = (startMinutes / (24 * 60)) * 576;
              const mobileHeight = Math.max(
                24,
                ((endMinutes - startMinutes) / (24 * 60)) * 576
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
                      handleEventClick(event);
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
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

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Navigation */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          {/* Mobile: alles in eine Zeile */}
          <div className="flex flex-col sm:block">
            {/* Mobile: navigation row */}
            <div className="flex items-center justify-between gap-1 w-full sm:hidden">
              {/* Left: arrows + Heute */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  onClick={() => navigateDate("prev")}
                  className="bg-transparent w-9 h-9 p-0 flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigateDate("next")}
                  className="bg-transparent w-9 h-9 p-0 flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={goToToday}
                  className="bg-transparent text-xs w-auto h-9 px-2"
                >
                  Heute
                </Button>
              </div>
              {/* Right: M/W/T button group */}
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
                ].map(({ type, mobileLabel }, idx, arr) => (
                  <Button
                    key={type}
                    variant={viewType === type ? "primary" : "ghost"}
                    onClick={() => setViewType(type)}
                    className={`border-0 rounded-none flex items-center justify-center ${
                      idx === 0 ? "rounded-l-lg" : ""
                    } ${idx === arr.length - 1 ? "rounded-r-lg" : ""} ${
                      viewType === type ? "" : "bg-transparent hover:bg-white"
                    } ${idx > 0 ? "-ml-px" : ""} w-9 h-9 p-0`}
                  >
                    {mobileLabel}
                  </Button>
                ))}
              </div>
            </div>
            {/* Desktop: 3-Spalten-Grid */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-2 w-full">
              {/* Links: Navigation + Heute */}
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
              {/* Mitte: Titel zentriert */}
              <div className="flex justify-center">
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
        <CardContent className="p-1 sm:p-4">
          <div className="overflow-hidden">
            <div className="relative">
              {viewType === "month" && renderMonthView()}
              {viewType === "week" && renderWeekView()}
              {viewType === "day" && renderDayView()}
            </div>
          </div>
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
                  <span className="font-medium">
                    {selectedEvent.session.module}
                  </span>
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
