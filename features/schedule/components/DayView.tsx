"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { isSameDay } from "date-fns";
import type { CalendarEvent } from "@/features/schedule/types/calendar";
import type { Session } from "@/shared/data/mockData";
import {
  getSessionColor,
  formatEventTime,
} from "@/features/schedule/utils/calendarHelpers";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSessionClick: (session: Session) => void;
}

export function DayView({ currentDate, events, onSessionClick }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter((event) =>
    isSameDay(event.startTime, currentDate)
  );
  const hourHeight = 42; // px (desktop)
  const dayColumnHeight = 24 * hourHeight; // 1008px (desktop)

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
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
}
