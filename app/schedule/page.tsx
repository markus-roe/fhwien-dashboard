"use client";

import { useState, useMemo } from "react";
import { SessionPanel } from "@/components/schedule/SessionPanel";
import { useSessionPanel } from "@/components/schedule/hooks/useSessionPanel";
import { CalendarView } from "@/components/schedule/CalendarView";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  mockSessions,
  mockCoachingSlots,
  mockCourses,
  currentUser,
} from "@/data/mockData";
import type { Session } from "@/data/mockData";

export default function SchedulePage() {
  const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
    useSessionPanel();

  // Get all unique course IDs from sessions
  const allCourseIds = useMemo(() => {
    const courseIds = new Set<string>();
    mockSessions.forEach((session) => {
      if (session.courseId) courseIds.add(session.courseId);
    });
    mockCoachingSlots
      .filter((slot) => slot.participants.some((p) => p === currentUser.name))
      .forEach((slot) => {
        if (slot.courseId) courseIds.add(slot.courseId);
      });
    return Array.from(courseIds);
  }, []);

  // Initialize all courses as visible
  const [visibleCourseIds, setVisibleCourseIds] = useState<Set<string>>(
    () => new Set(allCourseIds)
  );

  const handleCourseVisibilityChange = (courseId: string, visible: boolean) => {
    setVisibleCourseIds((prev) => {
      const next = new Set(prev);
      if (visible) {
        next.add(courseId);
      } else {
        next.delete(courseId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 w-full flex-1 min-h-0 overflow-hidden">
        {/* Desktop: Full sidebar with NextUpCard and NextUpList */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 space-y-3 lg:overflow-y-scroll">
          <Sidebar
            showCalendar={false}
            showNextUpCard={true}
            onSessionClick={openSessionPanel}
            visibleCourseIds={visibleCourseIds}
            onCourseVisibilityChange={handleCourseVisibilityChange}
          />
        </aside>

        {/* Calendar - full width on mobile, flex-1 on desktop */}
        <div className="flex-1 min-w-0 w-full min-h-0 flex flex-col overflow-hidden">
          <CalendarView
            onSessionClick={openSessionPanel}
            visibleCourseIds={visibleCourseIds}
          />
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
