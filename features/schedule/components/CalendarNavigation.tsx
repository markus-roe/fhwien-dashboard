"use client";

import { Button } from "@/shared/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { ViewType } from "./types/calendar";

interface CalendarNavigationProps {
  viewType: ViewType;
  currentDate: Date;
  dateTitle: string;
  onViewChange: (view: ViewType) => void;
  onNavigateDate: (direction: "prev" | "next") => void;
  onGoToToday: () => void;
}

const VIEW_OPTIONS: Array<{
  type: ViewType;
  label: string;
  mobileLabel: string;
}> = [
  { type: "month", label: "Monat", mobileLabel: "M" },
  { type: "week", label: "Woche", mobileLabel: "W" },
  { type: "day", label: "Tag", mobileLabel: "T" },
  { type: "list", label: "Terminübersicht", mobileLabel: "L" },
];

export function CalendarNavigation({
  viewType,
  currentDate,
  dateTitle,
  onViewChange,
  onNavigateDate,
  onGoToToday,
}: CalendarNavigationProps) {
  return (
    <div className="flex flex-col sm:block">
      {/* Mobile: navigation row */}
      <div className="flex items-center justify-between gap-1 w-full sm:hidden">
        {/* Left: arrows + Heute */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {viewType !== "list" && (
            <>
              <Button
                variant="ghost"
                onClick={() => onNavigateDate("prev")}
                className="bg-transparent w-8 h-8 p-0 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigateDate("next")}
                className="bg-transparent w-8 h-8 p-0 flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={onGoToToday}
                className="bg-transparent w-8 h-8 p-0 flex items-center justify-center"
                title="Heute"
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
        {/* Right: M/W/T/L button group */}
        <div className="flex rounded-lg overflow-hidden border bg-gray-100 flex-shrink-0">
          {VIEW_OPTIONS.map(({ type, mobileLabel }, idx, arr) => (
            <Button
              key={type}
              variant="ghost"
              onClick={() => onViewChange(type)}
              className={`border-0 rounded-none flex items-center justify-center ${
                idx === 0 ? "rounded-l-lg" : ""
              } ${idx === arr.length - 1 ? "rounded-r-lg" : ""} ${
                viewType === type
                  ? "bg-zinc-200 text-zinc-900 font-medium shadow-sm"
                  : "bg-transparent hover:bg-zinc-200/50 text-zinc-600"
              } ${idx > 0 ? "-ml-px" : ""} w-8 h-8 p-0 text-xs`}
            >
              {mobileLabel}
            </Button>
          ))}
        </div>
      </div>
      {/* Desktop: 3-Spalten-Grid */}
      <div className="hidden sm:grid sm:items-center sm:gap-2 w-full sm:grid-cols-[1fr_auto_1fr]">
        {/* Links: Navigation + Heute */}
        <div className="flex items-center gap-2 justify-start">
          {viewType !== "list" && (
            <>
              <Button
                variant="ghost"
                onClick={() => onNavigateDate("prev")}
                className="bg-transparent p-2 sm:p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigateDate("next")}
                className="bg-transparent p-2 sm:p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={onGoToToday}
                className="bg-transparent text-xs sm:text-sm"
              >
                Heute
              </Button>
            </>
          )}
        </div>
        {/* Mitte: Titel zentriert */}
        <div className="flex justify-center">
          <h3 className="text-base sm:text-xl font-semibold text-center">
            {dateTitle}
          </h3>
        </div>
        {/* Rechts: Ansichtsauswahl */}
        <div className="flex items-center gap-2 justify-end">
          <div className="flex rounded-lg overflow-hidden border bg-gray-100">
            {VIEW_OPTIONS.map(({ type, label }, idx, arr) => (
              <Button
                key={type}
                variant="ghost"
                onClick={() => onViewChange(type)}
                className={`text-sm px-3 py-1 border-0 rounded-none ${
                  idx === 0 ? "rounded-l-lg" : ""
                } ${idx === arr.length - 1 ? "rounded-r-lg" : ""} ${
                  viewType === type
                    ? "bg-zinc-200 text-[#012f64] font-medium shadow-sm"
                    : "bg-transparent hover:bg-zinc-200/50 text-zinc-600"
                } ${idx > 0 ? "-ml-px" : ""}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

