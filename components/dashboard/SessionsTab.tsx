"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "./DataTable";
import { SessionRow } from "./SessionRow";
import { SessionCard } from "./SessionCard";
import { useSessions } from "./hooks/useSessions";
import type { Session, Course } from "@/data/mockData";

type SessionsTabProps = {
  sessions: Session[];
  courses: Course[];
  selectedCourseId: string | null;
  onCourseChange: (courseId: string | null) => void;
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
  onCreate: () => void;
};

export function SessionsTab({
  sessions,
  courses,
  selectedCourseId,
  onCourseChange,
  onEdit,
  onDelete,
  onCreate,
}: SessionsTabProps) {
  const [showPastSessions, setShowPastSessions] = useState(false);
  const { pastSessions, sessionsToShow } = useSessions(
    sessions,
    showPastSessions
  );

  const headerColumns = selectedCourseId
    ? ["Datum", "Zeit", "Titel", "Ort", ""]
    : ["Datum", "Zeit", "Fach", "Titel", "Ort", ""];

  const gridCols = selectedCourseId
    ? "grid-cols-[140px,100px,1fr,180px,auto]"
    : "grid-cols-[140px,100px,180px,1fr,180px,auto]";

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 flex-1">
          Lehrveranstaltungen verwalten
        </h2>
        <Button
          size="sm"
          className="h-8 px-2 sm:px-3 text-xs shrink-0 w-full sm:w-auto"
          icon={Plus}
          iconPosition="left"
          onClick={onCreate}
        >
          Neuer Termin
        </Button>
      </div>

      <DataTable
        items={sessionsToShow}
        emptyMessage="Für dieses Fach sind aktuell keine Lehrveranstaltungen hinterlegt."
        headerColumns={headerColumns}
        gridCols={gridCols}
        renderRow={(session) => {
          const course = courses.find((c) => c.id === session.courseId);
          return (
            <SessionRow
              key={session.id}
              session={session}
              course={course}
              showCourse={!selectedCourseId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        }}
        renderCard={(session) => {
          const course = courses.find((c) => c.id === session.courseId);
          return (
            <SessionCard
              key={session.id}
              session={session}
              course={course}
              showCourse={!selectedCourseId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        }}
        pastItemsCount={pastSessions.length}
        showPastItems={showPastSessions}
        onTogglePastItems={() => setShowPastSessions(!showPastSessions)}
        pastItemsLabel="Vergangene Termine"
      />
    </div>
  );
}
