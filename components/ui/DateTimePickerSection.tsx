"use client";

import { useEffect, useState } from "react";
import { format, parse, isValid } from "date-fns";
import { de } from "date-fns/locale";
import { DatePickerCalendar } from "@/components/ui/DatePickerCalendar";
import { TimeInput } from "@/components/ui/TimeInput";
import { Input } from "@/components/ui/Input";

type DateTimePickerSectionProps = {
  date: Date;
  time: string;
  endTime: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onEndTimeChange: (endTime: string) => void;
};

export function DateTimePickerSection({
  date,
  time,
  endTime,
  onDateChange,
  onTimeChange,
  onEndTimeChange,
}: DateTimePickerSectionProps) {
  const [dateInputValue, setDateInputValue] = useState(
    format(date, "d.M.yyyy", { locale: de })
  );

  // Update input value when date changes externally (e.g., from calendar)
  useEffect(() => {
    setDateInputValue(format(date, "d.M.yyyy", { locale: de }));
  }, [date]);

  const handleDateInputChange = (value: string) => {
    setDateInputValue(value);

    // Try to parse different date formats
    const formats = [
      "d.M.yyyy",
      "d.M.yy",
      "d/M/yyyy",
      "d/M/yy",
      "d-M-yyyy",
      "d-M-yy",
    ];
    let parsedDate: Date | null = null;

    for (const fmt of formats) {
      try {
        const parsed = parse(value, fmt, new Date(), {
          locale: de,
        });
        if (parsed && isValid(parsed)) {
          parsedDate = parsed;
          break;
        }
      } catch {
        // Continue to next format
      }
    }

    if (parsedDate) {
      onDateChange(parsedDate);
    }
  };

  const handleDateInputBlur = (value: string) => {
    // On blur, try to parse and format the value
    const formats = [
      "d.M.yyyy",
      "d.M.yy",
      "d/M/yyyy",
      "d/M/yy",
      "d-M-yyyy",
      "d-M-yy",
    ];
    let parsedDate: Date | null = null;

    for (const fmt of formats) {
      try {
        const parsed = parse(value, fmt, new Date(), {
          locale: de,
        });
        if (parsed && isValid(parsed)) {
          parsedDate = parsed;
          break;
        }
      } catch {
        // Continue to next format
      }
    }

    if (parsedDate) {
      onDateChange(parsedDate);
      setDateInputValue(format(parsedDate, "dd.M.yyyy", { locale: de }));
    } else if (!value.trim()) {
      // If empty, reset to current date
      setDateInputValue(format(date, "dd.M.yyyy", { locale: de }));
    }
  };

  return (
    <div className="space-y-3">
      <div>
        {/* Desktop: Calendar */}
        <div className="hidden md:block mb-1.5 -mx-1 sm:mx-0 md:scale-90 md:origin-top-left">
          <DatePickerCalendar
            selected={date}
            onSelect={(selectedDate) => {
              const newDate = selectedDate ?? new Date();
              onDateChange(newDate);
              setDateInputValue(format(newDate, "d.M.yyyy", { locale: de }));
            }}
          />
        </div>
        <label className="hidden md:block text-sm font-medium text-zinc-700 mb-1">
          Datum
        </label>
        {/* Desktop: Text input */}
        <Input
          value={dateInputValue}
          onChange={(e) => handleDateInputChange(e.target.value)}
          onBlur={(e) => handleDateInputBlur(e.target.value)}
          placeholder="dd.mm.yyyy"
          className="hidden md:block w-full md:w-[270px]"
        />
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="hidden md:block text-sm font-medium text-zinc-700 mb-1">
            Startzeit
          </label>
          {/* Desktop: Custom time input */}
          <TimeInput
            value={time}
            onChange={(timeValue) => onTimeChange(timeValue ?? "")}
            placeholder=""
            className="hidden md:block w-full md:w-[270px]"
          />
        </div>
        <div>
          <label className="hidden md:block text-sm font-medium text-zinc-700 mb-1">
            Endzeit
          </label>
          {/* Desktop: Custom time input */}
          <TimeInput
            value={endTime}
            onChange={(endTimeValue) => onEndTimeChange(endTimeValue ?? "")}
            placeholder=""
            className="hidden md:block w-full md:w-[270px]"
          />
        </div>
      </div>
    </div>
  );
}
