"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { MainLayout } from "@/components/layout/MainLayout";
import { NextUpCard } from "@/components/schedule/NextUpCard";
// import { FilterBar } from '@/components/schedule/FilterBar'
// import { ModuleProgressWidget } from '@/components/schedule/ModuleProgressWidget'
// import { TodayList } from "@/components/schedule/TodayList";
// import { TasksWidget } from "@/components/schedule/TasksWidget";
import { WeeklyGrid } from "@/components/schedule/WeeklyGrid";
import { SessionPanel } from "@/components/schedule/SessionPanel";
import {
  mockSessions,
  mockGroups,
  getWeekDays,
  getSessionsForDay,
  organizeSessionsByTimeSlots,
  currentUser,
  type Program,
  type Session,
} from "@/data/mockData";

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Start with Monday of current week
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    return monday;
  });

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

  const weekDays = getWeekDays(currentWeekStart);
  const today = new Date();

  // Get today's sessions - normalize today's date to compare only date part
  const todayNormalized = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const todaySessions = getSessionsForDay(allSessions, todayNormalized)
    .sort((a, b) => {
      // Sort by time
      const [aHours, aMinutes] = a.time.split(":").map(Number);
      const [bHours, bMinutes] = b.time.split(":").map(Number);
      return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    })
    .map((session) => {
      // Create a proper date-time for comparison

      const sessionStartTime = new Date(session.date);
      const sessionEndTime = new Date(session.date);
      const [endHours, endMinutes] = session.endTime.split(":").map(Number);
      sessionEndTime.setHours(endHours, endMinutes, 0, 0);

      const now = new Date();

      return {
        id: session.id,
        time: session.time,
        title: session.title, // Use full title
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

  const nextUpSession = todaySessions.find((s) => s.isLive) || todaySessions[0];

  // Organize sessions for weekly grid
  const timeSlots = organizeSessionsByTimeSlots(allSessions, weekDays);

  const handleSessionClick = (sessionId: string) => {
    const session = allSessions.find((s) => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setIsPanelOpen(true);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    // Mock task toggle - in real app, update state
    console.log("Toggle task:", taskId);
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const handleToday = () => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    setCurrentWeekStart(monday);
  };

  const weekRange = `${format(weekDays[0], "d. MMM", {
    locale: de,
  })} – ${format(weekDays[6], "d. MMM yyyy", { locale: de })}`;

  return (
    <MainLayout>
      {/* Header */}
      {/* <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Mein Terminplan</h1>
      </header> */}

      {/* Hero Section */}
      {nextUpSession && (
        <NextUpCard
          session={nextUpSession}
          onOpenPanel={() => handleSessionClick(nextUpSession.id)}
        />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN */}
        {/* <aside className="lg:col-span-3 space-y-6">
          <FilterBar selectedProgram={selectedProgram} onProgramChange={setSelectedProgram} />

          <ModuleProgressWidget progress={mockModuleProgress} />

          <TodayList
            date={today}
            sessions={todaySessions}
            onSessionClick={handleSessionClick}
          />

          <TasksWidget tasks={mockTasks} onTaskToggle={handleTaskToggle} />
        </aside> */}

        {/* RIGHT COLUMN (Weekly Grid) */}
        <WeeklyGrid
          sessions={allSessions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSessionClick={handleSessionClick}
        />
      </div>

      {/* Slide-over Panel */}
      <SessionPanel
        session={selectedSession}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </MainLayout>
  );
}
