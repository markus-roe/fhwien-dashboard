"use client";

import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import type { CalendarEvent } from "@/features/schedule/types/calendar";
import type { Session } from "@/shared/lib/api-types";
import {
  getSessionColor,
  formatEventTime,
} from "@/features/schedule/utils/calendarHelpers";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSessionClick: (session: Session) => void;
}

export function WeekView({
  currentDate,
  events,
  onSessionClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourHeight = 42; // px (desktop)
  const dayColumnHeight = 24 * hourHeight; // 1008px (desktop)

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="overflow-x-auto flex-shrink-0">
        <div className="min-w-[320px] sm:min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-[2rem_repeat(7,1fr)] sm:grid-cols-[3rem_repeat(7,1fr)] border-t border-gray-150 sticky top-0 bg-white z-10">
            <div className="w-8 sm:w-12"></div>
            {weekDays.map((day) => (
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
      <div className="flex-1 min-h-0 overflow-auto">
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
              {weekDays.map((day) => {
                const dayEvents = events.filter((event) =>
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
                      const mobileTop =
                        (startMinutes / (24 * 60)) * containerHeight;
                      const mobileHeight = Math.max(
                        24,
                        ((endMinutes - startMinutes) / (24 * 60)) *
                          containerHeight
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
}
