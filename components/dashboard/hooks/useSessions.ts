import { useMemo } from "react";
import type { Session } from "@/data/mockData";
import {
  sortSessionsByDateTime,
  isSessionPast,
  getSessionEndDateTime,
} from "@/lib/dashboardUtils";

export function useSessions(sessions: Session[], showPastSessions: boolean) {
  const now = new Date();

  const sortedSessions = useMemo(
    () => sortSessionsByDateTime(sessions),
    [sessions]
  );

  const pastSessions = useMemo(
    () => sortedSessions.filter((session) => isSessionPast(session)),
    [sortedSessions]
  );

  const sessionsToShow = useMemo(() => {
    if (showPastSessions) {
      return sortedSessions;
    }
    return sortedSessions.filter((session) => {
      const sessionEndDateTime = getSessionEndDateTime(session);
      return sessionEndDateTime >= now;
    });
  }, [sortedSessions, showPastSessions, now]);

  return {
    sortedSessions,
    pastSessions,
    sessionsToShow,
  };
}
