"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CourseSelector } from "./CourseSelector";
import { TabFilters } from "./TabFilters";
import { TabHeader } from "./TabHeader";
import { DataTable } from "./DataTable";
import { SessionRow } from "./SessionRow";
import { SessionCard } from "./SessionCard";
import { useSessions } from "../hooks/useSessions";
import type { Session, Course } from "@/shared/lib/api-types";

type SessionsTabProps = {
  sessions: Session[];
  courses: Course[];
  selectedCourseId: number | null;
  onCourseChange: (courseId: number | null) => void;
  onEdit: (session: Session) => void;
  onDelete: (session: Session) => void;
  onCreate: () => void;
  search: string;
  onSearchChange: (search: string) => void;
  loading?: boolean;
};

export function SessionsTab({
  sessions,
  courses,
  selectedCourseId,
  onCourseChange,
  onEdit,
  onDelete,
  onCreate,
  search,
  onSearchChange,
  loading = false,
}: SessionsTabProps) {
  const [showPastSessions, setShowPastSessions] = useState(false);
  const { pastSessions, sessionsToShow } = useSessions(
    sessions,
    showPastSessions
  );

  const headerColumns = ["Datum", "Zeit", "Fach", "Titel", "Ort", ""];

  const gridCols = "grid-cols-[140px,100px,180px,1fr,180px,auto]";

  return (
    <div className="space-y-5">
      <TabFilters
        leftFilter={
          <CourseSelector
            courses={courses}
            selectedCourseId={selectedCourseId}
            onCourseChange={onCourseChange}
          />
        }
        searchLabel="Lehrveranstaltungen suchen"
        searchPlaceholder="Titel, Ort oder Fach durchsuchen..."
        searchValue={search}
        onSearchChange={onSearchChange}
      />

      <TabHeader
        title="Lehrveranstaltungen verwalten"
        buttonLabel="Neuer Termin"
        buttonIcon={Plus}
        onButtonClick={onCreate}
      />

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
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        }}
        pastItemsCount={pastSessions.length}
        showPastItems={showPastSessions}
        onTogglePastItems={() => setShowPastSessions(!showPastSessions)}
        pastItemsLabel="Vergangene Termine"
        loading={loading}
      />
    </div>
  );
}
