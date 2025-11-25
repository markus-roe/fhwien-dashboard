"use client";

import { useState, useMemo, useEffect } from "react";
import { NextUpCard } from "@/components/schedule/NextUpCard";
import { NextUpList } from "@/components/schedule/NextUpList";
import { SessionPanel } from "@/components/schedule/SessionPanel";
import { useSessionPanel } from "@/components/schedule/hooks/useSessionPanel";
import {
  mockSessions,
  mockGroups,
  currentUser,
  type Session,
} from "@/data/mockData";
import { CalendarView } from "@/components/schedule/CalendarView";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function SchedulePage() {
  const {
    selectedSession,
    isPanelOpen,
    openSessionPanel,
    closeSessionPanel,
  } = useSessionPanel();

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
      return group.members.some((m) => m.id === currentUser.id);
    });
  }, [groupSessions]);

  // Combine regular sessions with user's group sessions
  const allSessions = useMemo(() => {
    return [...mockSessions, ...userGroupSessions];
  }, [userGroupSessions]);

  const today = new Date();


  // Get upcoming sessions for the next 7 days
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999); // End of day 7

    return allSessions
      .filter((session) => {
        const sessionDate = new Date(session.date);
        // Normalize to compare only dates (ignore time)
        const sessionDateOnly = new Date(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate()
        );
        const nowDateOnly = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const sevenDaysDateOnly = new Date(
          sevenDaysFromNow.getFullYear(),
          sevenDaysFromNow.getMonth(),
          sevenDaysFromNow.getDate()
        );

        // Check if session is within the 7-day window
        if (sessionDateOnly < nowDateOnly || sessionDateOnly > sevenDaysDateOnly) {
          return false;
        }

        // For today's sessions, check if they haven't ended yet
        if (sessionDateOnly.getTime() === nowDateOnly.getTime()) {
          const sessionEndTime = new Date(session.date);
          const [endHours, endMinutes] = session.endTime.split(":").map(Number);
          sessionEndTime.setHours(endHours, endMinutes, 0, 0);
          // Only include if session hasn't ended yet
          return sessionEndTime > now;
        }

        // For future days, include all sessions
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const [aHours, aMinutes] = a.time.split(":").map(Number);
        const [bHours, bMinutes] = b.time.split(":").map(Number);
        dateA.setHours(aHours, aMinutes, 0, 0);
        dateB.setHours(bHours, bMinutes, 0, 0);
        return dateA.getTime() - dateB.getTime();
      })
      .map((session) => {
        const sessionStartTime = new Date(session.date);
        const sessionEndTime = new Date(session.date);
        const [startHours, startMinutes] = session.time.split(":").map(Number);
        const [endHours, endMinutes] = session.endTime.split(":").map(Number);
        sessionStartTime.setHours(startHours, startMinutes, 0, 0);
        sessionEndTime.setHours(endHours, endMinutes, 0, 0);

        return {
          id: session.id,
          time: session.time,
          title: session.title,
          date: session.date,
          endTime: session.endTime,
          locationType: session.locationType,
          type:
            session.type === "lecture"
              ? "Vorlesung"
              : session.type === "workshop"
              ? "Workshop"
              : "Coaching",
          location:
            session.locationType === "online" ? "Online" : session.location,
          isLive: sessionStartTime <= now && sessionEndTime >= now,
          isPast: sessionEndTime < now,
        };
      });
  }, [allSessions]);

  const nextUpSession = upcomingSessions[0];


  const handleSessionClick = (sessionId: string) => {
    const session = allSessions.find((s) => s.id === sessionId);
    if (session) {
      openSessionPanel(session);
    }
  };


  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
        {/* Mobile: Only show NextUpCard as compact banner */}
        {nextUpSession && (
          <div className="lg:hidden mb-3 shrink-0">
            <NextUpCard
              session={nextUpSession}
              onOpenPanel={() => handleSessionClick(nextUpSession.id)}
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 w-full flex-1 min-h-0 overflow-hidden">
          {/* Desktop: Full sidebar with NextUpCard and NextUpList */}
          <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 space-y-3 lg:overflow-y-auto">
            {nextUpSession && (
              <NextUpCard
                session={nextUpSession}
                onOpenPanel={() => handleSessionClick(nextUpSession.id)}
              />
            )}
            <NextUpList
              sessions={upcomingSessions}
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
