"use client";

import { SessionPanel } from "@/components/schedule/SessionPanel";
import { useSessionPanel } from "@/components/schedule/hooks/useSessionPanel";
import { CalendarView } from "@/components/schedule/CalendarView";
import { Sidebar } from "@/components/layout/Sidebar";

export default function SchedulePage() {
  const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
    useSessionPanel();

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 w-full flex-1 min-h-0 overflow-hidden">
        {/* Desktop: Full sidebar with NextUpCard and NextUpList */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 space-y-3 lg:overflow-y-auto">
          <Sidebar
            showCalendar={false}
            showNextUpCard={true}
            onSessionClick={openSessionPanel}
          />
        </aside>

        {/* Calendar - full width on mobile, flex-1 on desktop */}
        <div className="flex-1 min-w-0 w-full min-h-0 flex flex-col overflow-hidden">
          <CalendarView onSessionClick={openSessionPanel} />
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
