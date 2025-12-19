import { useMemo } from "react";
import type { Session } from "@/shared/data/mockData";
import {
  sortSessionsByDateTime,
  isSessionPast,
  getSessionEndDateTime,
} from "@/shared/lib/dashboardUtils";

export function useSessions(sessions: Session[], showPastSessions: boolean) {
  const { pastSessions, upcomingSessions } = useMemo(() => {
    const past: Session[] = [];
    const upcoming: Session[] = [];

    sessions.forEach((session) => {
      if (isSessionPast(session)) {
        past.push(session);
      } else {
        upcoming.push(session);
      }
    });

    // Sort: upcoming ascending, past descending
    const sortedPast = [...past].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      return b.time.localeCompare(a.time);
    });

    return {
      pastSessions: sortedPast,
      upcomingSessions: sortSessionsByDateTime(upcoming),
    };
  }, [sessions]);

  const sessionsToShow = useMemo(() => {
    return showPastSessions
      ? [...upcomingSessions, ...pastSessions]
      : upcomingSessions;
  }, [showPastSessions, upcomingSessions, pastSessions]);

  return {
    pastSessions,
    sessionsToShow,
  };
}
