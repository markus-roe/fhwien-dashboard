"use client";

import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { de } from "date-fns/locale";
import { getISOWeek } from "date-fns";
import type { CalendarEvent } from "./types/calendar";
import type { Session } from "@/data/mockData";
import { getSessionColor, formatEventTime } from "./utils/calendarHelpers";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSessionClick: (session: Session) => void;
  onDateClick?: (date: Date) => void;
  onDayClick: (date: Date) => void;
  onDayMoreClick: (
    day: Date,
    events: CalendarEvent[],
    event: React.MouseEvent<HTMLElement>
  ) => void;
  onWeekClick: (weekStart: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  onSessionClick,
  onDateClick,
  onDayClick,
  onDayMoreClick,
  onWeekClick,
}: MonthViewProps) {
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
                onClick={() => onWeekClick(week[0])}
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
                  <div
                    className="text-xs sm:text-sm text-gray-600 hover:underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayClick(day);
                      if (onDateClick) onDateClick(day);
                    }}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-h-0">
                    <div className="flex flex-col gap-0.5 overflow-hidden max-h-[60px] sm:max-h-[90px]">
                      {events
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
                    </div>
                    {events.filter((event) => isSameDay(event.startTime, day))
                      .length > 3 && (
                      <div
                        className="text-[10px] sm:text-xs text-gray-500 cursor-pointer hover:underline flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDayMoreClick(
                            day,
                            events.filter((event) =>
                              isSameDay(event.startTime, day)
                            ),
                            e
                          );
                        }}
                      >
                        +
                        {events.filter((event) =>
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
                onClick={() => onWeekClick(week[0])}
              >
                <span>{getISOWeek(week[0])}</span>
              </div>
              {week.map((day, dayIndex) => {
                const dayEvents = events.filter((event) => {
                  return isSameDay(event.startTime, day);
                });
                const maxEvents = 3;
                const borderTop = weekIndex > 0 ? "border-t" : "";
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`min-w-0 min-h-[80px] sm:h-full px-0.5 sm:px-1 py-0.5 border-l ${borderTop} border-gray-150 flex flex-col ${
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
                          onDayClick(day);
                          if (onDateClick) onDateClick(day);
                        }}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-0.5 sm:space-y-1 flex-1 min-h-0">
                      <div className="space-y-0.5 sm:space-y-1 flex-1 overflow-hidden max-h-[60px] sm:max-h-[90px]">
                        {dayEvents.slice(0, maxEvents).map((event) => {
                          return (
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
                          );
                        })}
                      </div>
                      {dayEvents.length > maxEvents && (
                        <div
                          className="text-[10px] sm:text-xs text-gray-500 cursor-pointer hover:underline flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDayMoreClick(day, dayEvents, e);
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
}
