"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type TimePickerCalendarProps = {
  selected?: string; // Format: "HH:mm"
  onSelect?: (time: string) => void;
  interval?: number; // Minutes interval (default: 15)
};

export function TimePickerCalendar({
  selected,
  onSelect,
  interval = 15,
}: TimePickerCalendarProps) {
  const [selectedHour, selectedMinute] = selected
    ? selected.split(":").map(Number)
    : [null, null];

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 / interval }, (_, i) => i * interval);

  const handleTimeSelect = (hour: number, minute: number) => {
    if (onSelect) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      onSelect(timeString);
    }
  };

  return (
    <div className="w-full min-w-[240px]">
      <div className="flex items-start justify-center gap-3">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Stunde
          </div>
          <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto px-1 py-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
            {hours.map((hour) => {
              const isSelected = selectedHour === hour;
              return (
                <button
                  key={hour}
                  type="button"
                  onClick={() => {
                    if (selectedMinute !== null) {
                      handleTimeSelect(hour, selectedMinute);
                    } else {
                      handleTimeSelect(hour, 0);
                    }
                  }}
                  className={cn(
                    "h-10 w-14 flex items-center justify-center text-sm rounded-lg transition-all duration-200 font-medium",
                    {
                      "text-zinc-700 hover:bg-zinc-100 hover:scale-105 active:scale-95":
                        !isSelected,
                      "bg-[var(--primary)] text-white font-semibold shadow-md hover:bg-[var(--primary)]/90 hover:shadow-lg":
                        isSelected,
                    }
                  )}
                >
                  {hour.toString().padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="text-2xl font-bold text-zinc-400 mt-10">:</div>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Minute
          </div>
          <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto px-1 py-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
            {minutes.map((minute) => {
              const isSelected = selectedMinute === minute;
              return (
                <button
                  key={minute}
                  type="button"
                  onClick={() => {
                    if (selectedHour !== null) {
                      handleTimeSelect(selectedHour, minute);
                    } else {
                      handleTimeSelect(12, minute);
                    }
                  }}
                  className={cn(
                    "h-10 w-14 flex items-center justify-center text-sm rounded-lg transition-all duration-200 font-medium",
                    {
                      "text-zinc-700 hover:bg-zinc-100 hover:scale-105 active:scale-95":
                        !isSelected,
                      "bg-[var(--primary)] text-white font-semibold shadow-md hover:bg-[var(--primary)]/90 hover:shadow-lg":
                        isSelected,
                    }
                  )}
                >
                  {minute.toString().padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

