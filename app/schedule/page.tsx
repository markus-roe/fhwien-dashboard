"use client";

import { useState, useCallback } from "react";
import { SessionPanel } from "@/features/schedule/components/SessionPanel";
import { useSessionPanel } from "@/features/schedule/components/hooks/useSessionPanel";
import { CalendarView } from "@/features/schedule/components/CalendarView";
import { Sidebar } from "@/shared/components/layout/Sidebar";

export default function SchedulePage() {
  const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
    useSessionPanel();

  const [visibleCourseIds, setVisibleCourseIds] = useState<Set<number>>(
    new Set()
  );

  const handleVisibleCourseIdsChange = useCallback((ids: Set<number>) => {
    setVisibleCourseIds(ids);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
          <Sidebar
            emptyMessage="Keine anstehenden Termine."
            onSessionClick={openSessionPanel}
            onVisibleCourseIdsChange={handleVisibleCourseIdsChange}
            showCourseFilterButtons
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="h-full flex flex-col min-h-0">
            <CalendarView
              onSessionClick={openSessionPanel}
              visibleCourseIds={visibleCourseIds}
            />
          </div>
        </div>
      </div>

      <SessionPanel
        session={selectedSession}
        isOpen={isPanelOpen}
        onClose={closeSessionPanel}
      />
    </div>
  );
}
