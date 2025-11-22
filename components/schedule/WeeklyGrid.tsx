"use client";

import { ListView } from "./ListView";
import { Tabs, Tab } from "../ui/Tabs";
import type { Session } from "@/data/mockData";
import { CalendarView } from "./CalendarView";

interface TimeSlot {
  time: string;
  sessions: Array<{
    dayIndex: number;
    session: {
      id: string;
      type: "lecture" | "workshop" | "coaching";
      title: string;
      program: string;
      location: string;
      locationType: "online" | "on-campus";
      participants?: number;
    };
  }>;
}

interface WeeklyGridProps {
  sessions: Session[];
  viewMode?: "calendar" | "list";
  onViewModeChange?: (mode: "calendar" | "list") => void;
  onSessionClick?: (sessionId: string) => void;
}

export const WeeklyGrid = ({
  sessions,
  viewMode = "calendar",
  onViewModeChange,
  onSessionClick,
}: WeeklyGridProps) => {
  return (
    <section className="lg:col-span-12 h-full flex flex-col">
      <div className="flex flex-col items-center mb-4 gap-3">
        {/* Tabs - centered */}
        <Tabs>
          <Tab
            active={viewMode === "calendar"}
            onClick={() => onViewModeChange?.("calendar")}
          >
            Kalenderansicht
          </Tab>
          <Tab
            active={viewMode === "list"}
            onClick={() => onViewModeChange?.("list")}
          >
            Listenansicht
          </Tab>
        </Tabs>
      </div>

      {/* Grid Container */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col relative">
        {viewMode === "list" && (
          <ListView sessions={sessions} onSessionClick={onSessionClick} />
        )}
        {viewMode === "calendar" && <CalendarView sessions={sessions} />}
      </div>
    </section>
  );
};
