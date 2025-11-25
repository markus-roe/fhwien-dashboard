"use client";

import { X } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { CalendarEvent } from "./types/calendar";
import type { Session } from "@/data/mockData";
import { getSessionColor, formatEventTime } from "./utils/calendarHelpers";

interface EventPopoverProps {
  events: CalendarEvent[];
  position: { top: number; left: number };
  onClose: () => void;
  onSessionClick: (session: Session) => void;
}

export function EventPopover({
  events,
  position,
  onClose,
  onSessionClick,
}: EventPopoverProps) {


  const sortedEvents = events.sort((a: CalendarEvent, b: CalendarEvent) => {
    const startDiff = a.startTime.getTime() - b.startTime.getTime();
    if (startDiff !== 0) return startDiff;
    return a.endTime.getTime() - b.endTime.getTime();
  });

  return (
    <>
      {/* Backdrop to close popover */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* Popover */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-[260px] sm:w-[280px] max-h-[320px] overflow-y-auto"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-2.5 py-1.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-700">
              {format(events[0]?.startTime || new Date(), "EEEE", { locale: de })}
            </span>
            <span className="text-xs text-gray-500">
              {format(events[0]?.startTime || new Date(), "dd.MM.yyyy", { locale: de })}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-2.5 py-1.5">
          <div className="space-y-1">
            {sortedEvents.map((ev) => (
              <div
                key={ev.id}
                className="px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  onSessionClick(ev.session);
                  onClose();
                }}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: getSessionColor(ev.session),
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {ev.summary}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {formatEventTime(ev)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

