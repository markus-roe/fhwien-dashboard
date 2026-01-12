"use client";

import { useCallback, useState } from "react";
import type { Session } from "@/shared/lib/api-types";

export function useSessionPanel() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const openSessionPanel = useCallback((session: Session) => {
    setSelectedSession(session);
    setIsPanelOpen(true);
  }, []);

  const closeSessionPanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const handleSessionClick = useCallback(
    (session: Session) => {
      openSessionPanel(session);
    },
    [openSessionPanel]
  );

  return {
    selectedSession,
    isPanelOpen,
    openSessionPanel,
    closeSessionPanel,
    handleSessionClick,
  };
}
