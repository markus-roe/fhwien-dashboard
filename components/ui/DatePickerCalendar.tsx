"use client";

import { useMemo, useState, useEffect } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  getYear,
  getMonth,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DatePickerCalendarProps = {
  selected?: Date;
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  minDate?: Date;
};

export function DatePickerCalendar({
  selected,
  onSelect,
  disabled,
  minDate,
}: DatePickerCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    selected || minDate || new Date()
  );

  // Auto-scroll to selected date's month when selected changes
  useEffect(() => {
    if (selected && !isSameMonth(currentMonth, selected)) {
      setCurrentMonth(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const calendarContent = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const isDateDisabled = (date: Date) => {
      if (minDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        if (checkDate < today) return true;
      }
      return disabled?.(date) || false;
    };

    const isDateSelected = (date: Date) => {
      if (!selected) return false;
      return format(date, "yyyy-MM-dd") === format(selected, "yyyy-MM-dd");
    };

    const handleTodayClick = () => {
      const today = new Date();
      setCurrentMonth(today);
      if (onSelect) {
        onSelect(today);
      }
    };

    const today = new Date();
    const isTodaySelected = selected && isToday(selected);
    const isCurrentMonthInView = isSameMonth(currentMonth, today);
    const showTodayButton = !isTodaySelected || !isCurrentMonthInView;

    return (
      <div className="w-full min-w-[300px]">
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-900">
              {format(currentMonth, "MMMM yyyy", { locale: de })}
            </h3>
          </div>
          <div className="flex gap-1">
            {showTodayButton && (
              <button
                onClick={handleTodayClick}
                className="px-2 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-all"
                aria-label="Heute auswählen"
              >
                Heute
              </button>
            )}
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-zinc-100 rounded-lg transition-all hover:scale-105 active:scale-95"
              aria-label="Vorheriger Monat"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-600" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-zinc-100 rounded-lg transition-all hover:scale-105 active:scale-95"
              aria-label="Nächster Monat"
            >
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((dayLabel) => (
              <div
                key={dayLabel}
                className="text-xs font-semibold text-zinc-500 text-center uppercase tracking-wide"
              >
                {dayLabel}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weeks.flat().map((weekDay, idx) => {
              const isCurrentMonthDay = isSameMonth(weekDay, currentMonth);
              const isTodayDate = isToday(weekDay);
              const isSelected = isDateSelected(weekDay);
              const isDisabled = isDateDisabled(weekDay);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (!isDisabled && onSelect) {
                      onSelect(weekDay);
                    }
                  }}
                  disabled={isDisabled}
                  className={cn(
                    "h-10 w-10 flex items-center justify-center text-sm rounded-lg transition-all duration-200 font-medium",
                    {
                      "text-zinc-300 cursor-default": !isCurrentMonthDay,
                      "text-zinc-700 hover:bg-zinc-100 hover:scale-105 active:scale-95":
                        isCurrentMonthDay &&
                        !isSelected &&
                        !isTodayDate &&
                        !isDisabled,
                      "bg-[var(--primary)] text-white font-semibold shadow-md hover:bg-[var(--primary)]/90 hover:shadow-lg hover:scale-105 active:scale-95":
                        isSelected,
                      "bg-zinc-100 text-zinc-900 font-semibold border-2 border-zinc-200 hover:bg-zinc-200 hover:scale-105 active:scale-95":
                        isTodayDate && !isSelected,
                      "text-zinc-300 cursor-not-allowed opacity-40": isDisabled,
                    }
                  )}
                >
                  {format(weekDay, "d")}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }, [currentMonth, selected, onSelect, disabled, minDate]);

  return calendarContent;
}
