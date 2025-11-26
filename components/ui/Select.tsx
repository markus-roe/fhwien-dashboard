"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function Select({
  options,
  value,
  onChange,
  placeholder = "Auswählen",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(
    undefined
  );
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  useEffect(() => {
    if (open && triggerWidth) {
      const content = document.querySelector(
        "[data-popover-content]"
      ) as HTMLElement;
      if (content) {
        content.style.width = `${triggerWidth}px`;
      }
    }
  }, [open, triggerWidth]);

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          className={cn(
            "relative w-full pl-3 pr-10 py-2 border border-zinc-200 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
            "text-left bg-white disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-100 hover:border-zinc-300",
            triggerClassName,
            className
          )}
        >
          <span
            className={cn("block truncate", !selectedOption && "text-zinc-400")}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-400 transition-transform duration-150 ease-in-out",
                open && "transform rotate-180"
              )}
            />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-1 max-h-[300px] overflow-auto", contentClassName)}
        align="start"
        data-popover-content
      >
        <div className="space-y-0.5">
          {options.map((option) => {
            const isSelected = value === option.value;
            const isDisabled = option.disabled || false;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (isSelected) return;
                  !isDisabled && handleSelect(option.value);
                }}
                disabled={isDisabled}
                className={cn(
                  "w-full px-3 py-2 text-sm text-left rounded-lg",
                  "flex items-center justify-between gap-2",
                  "transition-colors duration-100 hover:bg-zinc-100",
                  {
                    "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90":
                      isSelected,
                    "text-zinc-700": !isSelected && !isDisabled,
                    "text-zinc-300 cursor-not-allowed opacity-50": isDisabled,
                    "active:bg-zinc-200 active:text-zinc-900": !isSelected,
                  }
                )}
              >
                <span className="truncate flex-1">{option.label}</span>
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
