"use client";

import type { CSSProperties } from "react";

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
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white/70 p-2 shadow-inner shadow-white/40",
        className
      )}
    >
      <div className="grid gap-2" style={gridStyle}>
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)]",
                isActive
                  ? "border-primary/80 bg-primary text-white shadow-lg shadow-primary/30"
                  : "border-transparent bg-zinc-50 text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50/80",
                buttonClassName
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-base leading-tight">{option.label}</span>
                {option.badge !== undefined && (
                  <span
                    className={cn(
                      "inline-flex min-w-[28px] items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      isActive
                        ? "border-white/50 bg-white/10 text-white"
                        : "border-zinc-200 bg-white text-zinc-600"
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
