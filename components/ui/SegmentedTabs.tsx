"use client";

import { cn } from "@/lib/utils";

export type SegmentedTabOption = {
  value: string;
  label: string;
  badge?: string | number;
};

type SegmentedTabsProps = {
  value: string;
  options: SegmentedTabOption[];
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
};

export function SegmentedTabs({
  value,
  options,
  onChange,
  className,
  buttonClassName,
}: SegmentedTabsProps) {
  return (
    <div className={cn("border-b border-zinc-200", className)}>
      <div className="flex overflow-x-auto scrollbar-hide -mb-px">
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "relative flex items-center justify-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)]",
                "border-b-2 border-transparent",
                isActive
                  ? "text-primary border-primary"
                  : "text-zinc-600 hover:text-zinc-900 hover:border-zinc-300",
                "sm:px-6",
                buttonClassName
              )}
            >
              <span className="flex items-center gap-2">
                <span>{option.label}</span>
                {option.badge !== undefined && (
                  <span
                    className={cn(
                      "inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-zinc-100 text-zinc-600"
                    )}
                  >
                    {option.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
