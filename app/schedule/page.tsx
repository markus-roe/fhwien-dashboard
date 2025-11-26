"use client";

import { useState, useMemo, useEffect } from "react";
import { SessionPanel } from "@/components/schedule/SessionPanel";
import { useSessionPanel } from "@/components/schedule/hooks/useSessionPanel";
import {
  mockSessions,
  mockGroups,
  currentUser,
  type Session,
} from "@/data/mockData";
import { CalendarView } from "@/components/schedule/CalendarView";
import { Sidebar } from "@/components/layout/Sidebar";

export default function SchedulePage() {
  const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
    useSessionPanel();

  // Load group sessions from localStorage
  const [groupSessions, setGroupSessions] = useState<Session[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("groupSessions");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((s: any) => ({
          ...s,
          date: new Date(s.date),
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Listen for storage changes to update when group sessions are added
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "groupSessions") {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setGroupSessions(
              parsed.map((s: any) => ({
                ...s,
                date: new Date(s.date),
              }))
            );
          } catch (e) {
            // Ignore parse errors
          }
        } else {
          setGroupSessions([]);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event for same-tab updates
    const handleCustomStorageChange = () => {
      const stored = localStorage.getItem("groupSessions");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setGroupSessions(
            parsed.map((s: any) => ({
              ...s,
              date: new Date(s.date),
            }))
          );
        } catch (e) {
          // Ignore parse errors
        }
      } else {
        setGroupSessions([]);
      }
    };

    window.addEventListener("groupSessionsUpdated", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "groupSessionsUpdated",
        handleCustomStorageChange
      );
    };
  }, []);

  // Filter group sessions to only show those where user is a member
  const userGroupSessions = useMemo(() => {
    return groupSessions.filter((session) => {
      if (!session.groupId) return false;
      const group = mockGroups.find((g) => g.id === session.groupId);
      if (!group) return false;
      return group.members.some((m) => m === currentUser.name);
    });
  }, [groupSessions]);

  // Combine regular sessions with user's group sessions
  const allSessions = useMemo(() => {
    return [...mockSessions, ...userGroupSessions];
  }, [userGroupSessions]);

  const handleSessionClick = (session: Session) => {
    openSessionPanel(session);
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 w-full flex-1 min-h-0 overflow-hidden">
        {/* Desktop: Full sidebar with NextUpCard and NextUpList */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 space-y-3 lg:overflow-y-auto">
          <Sidebar
            showCalendar={false}
            showNextUpCard={true}
            additionalSessions={userGroupSessions}
            onSessionClick={handleSessionClick}
          />
        </aside>

        {/* Calendar - full width on mobile, flex-1 on desktop */}
        <div className="flex-1 min-w-0 w-full min-h-0 flex flex-col overflow-hidden">
          <CalendarView
            sessions={allSessions}
            onSessionClick={openSessionPanel}
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
