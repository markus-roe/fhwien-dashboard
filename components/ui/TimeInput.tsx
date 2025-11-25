"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type TimeInputProps = {
  value?: string; // Format: "HH:mm"
  onChange?: (time: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

export function TimeInput({
  value = "",
  onChange,
  disabled,
  className,
  placeholder = "",
}: TimeInputProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const hoursInputRef = useRef<HTMLInputElement>(null);
  const minutesInputRef = useRef<HTMLInputElement>(null);
  const isInternalChangeRef = useRef(false);

  // Parse initial value - only update if value changed externally
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    
    if (value) {
      const [h, m] = value.split(":");
      const hNum = h ? parseInt(h, 10).toString() : "";
      const mNum = m ? parseInt(m, 10).toString() : "";
      setHours(hNum);
      setMinutes(mNum);
    } else {
      setHours("");
      setMinutes("");
    }
  }, [value]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(0, 2);
    if (val && parseInt(val) > 23) val = "23";
    
    isInternalChangeRef.current = true;
    setHours(val);
    
    // Auto-focus to minutes when 2 digits entered
    if (val.length === 2 && minutesInputRef.current) {
      minutesInputRef.current.focus();
    }
    
    // Only format when calling onChange, keep raw input in state
    if (onChange) {
      const min = minutes || "00";
      const formattedHours = val ? val.padStart(2, "0") : "00";
      const formattedMinutes = min ? min.padStart(2, "0") : "00";
      onChange(`${formattedHours}:${formattedMinutes}`);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 2) val = val.slice(0, 2);
    if (val && parseInt(val) > 59) val = "59";
    
    isInternalChangeRef.current = true;
    setMinutes(val);
    
    // Only format when calling onChange, keep raw input in state
    if (onChange) {
      const hr = hours || "00";
      const formattedHours = hr ? hr.padStart(2, "0") : "00";
      const formattedMinutes = val ? val.padStart(2, "0") : "00";
      onChange(`${formattedHours}:${formattedMinutes}`);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "hours" | "minutes"
  ) => {
    if (e.key === "ArrowRight" && type === "hours" && minutesInputRef.current) {
      e.preventDefault();
      minutesInputRef.current.focus();
    }
    if (e.key === "ArrowLeft" && type === "minutes" && hoursInputRef.current) {
      e.preventDefault();
      hoursInputRef.current.focus();
    }
    if (e.key === "Backspace" && e.currentTarget.value === "" && type === "minutes" && hoursInputRef.current) {
      hoursInputRef.current.focus();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
      <div className="flex items-center gap-1 pl-10 pr-3 py-2.5 min-h-[42px] border border-zinc-200 rounded-lg focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:border-transparent bg-white">
        <input
          ref={hoursInputRef}
          type="text"
          inputMode="numeric"
          value={hours}
          onChange={handleHoursChange}
          onKeyDown={(e) => handleKeyDown(e, "hours")}
          disabled={disabled}
          placeholder="00"
          maxLength={2}
          className="w-8 text-center text-sm font-medium text-zinc-900 bg-transparent border-none outline-none focus:bg-zinc-100 rounded px-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-[20px]"
        />
        <span className="text-zinc-400 font-medium">:</span>
        <input
          ref={minutesInputRef}
          type="text"
          inputMode="numeric"
          value={minutes}
          onChange={handleMinutesChange}
          onKeyDown={(e) => handleKeyDown(e, "minutes")}
          disabled={disabled}
          placeholder="00"
          maxLength={2}
          className="w-8 text-center text-sm font-medium text-zinc-900 bg-transparent border-none outline-none focus:bg-zinc-100 rounded px-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-[20px]"
        />
        {!hours && !minutes && placeholder && (
          <span className="absolute left-10 text-zinc-400 text-sm pointer-events-none">
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}

