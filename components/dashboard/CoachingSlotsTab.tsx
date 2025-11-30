"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CourseSelector } from "./CourseSelector";
import { TabFilters } from "./TabFilters";
import { TabHeader } from "./TabHeader";
import { DataTable } from "./DataTable";
import { CoachingSlotRow } from "./CoachingSlotRow";
import { CoachingSlotCard } from "./CoachingSlotCard";
import { useCoachingSlots } from "./hooks/useCoachingSlots";
import type { CoachingSlot, Course } from "@/data/mockData";

type CoachingSlotsTabProps = {
  slots: CoachingSlot[];
  courses: Course[];
  selectedCourseId: string | null;
  onCourseChange: (courseId: string | null) => void;
  onEdit: (slot: CoachingSlot) => void;
  onDelete: (slot: CoachingSlot) => void;
  onCreate: () => void;
  search: string;
  onSearchChange: (search: string) => void;
};

export function CoachingSlotsTab({
  slots,
  courses,
  selectedCourseId,
  onCourseChange,
  onEdit,
  onDelete,
  onCreate,
  search,
  onSearchChange,
}: CoachingSlotsTabProps) {
  const [showPastSlots, setShowPastSlots] = useState(false);
  const { pastSlots, slotsToShow } = useCoachingSlots(slots, showPastSlots);

  const headerColumns = ["Datum", "Zeit", "Fach", "Teilnehmer", "Beschreibung"];

  const gridCols = "grid-cols-[140px,100px,180px,200px,1fr,auto]";

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
        searchLabel="Coaching-Slots suchen"
        searchPlaceholder="Beschreibung, Teilnehmer oder Fach durchsuchen..."
        searchValue={search}
        onSearchChange={onSearchChange}
      />

      <TabHeader
        title="Coaching-Slots"
        buttonLabel="Neuer Slot"
        buttonIcon={Plus}
        onButtonClick={onCreate}
      />

      <DataTable
        items={slotsToShow}
        emptyMessage="Noch keine Coaching-Slots für dieses Fach angelegt."
        headerColumns={headerColumns}
        gridCols={gridCols}
        renderRow={(slot) => {
          const course = courses.find((c) => c.id === slot.courseId);
          return (
            <CoachingSlotRow
              key={slot.id}
              slot={slot}
              course={course}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        }}
        renderCard={(slot) => {
          const course = courses.find((c) => c.id === slot.courseId);
          return (
            <CoachingSlotCard
              key={slot.id}
              slot={slot}
              course={course}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        }}
        pastItemsCount={pastSlots.length}
        showPastItems={showPastSlots}
        onTogglePastItems={() => setShowPastSlots(!showPastSlots)}
        pastItemsLabel="Vergangene Slots"
      />
    </div>
  );
}
