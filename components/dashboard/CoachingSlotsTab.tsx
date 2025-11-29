"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CourseSelector } from "./CourseSelector";
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

  const headerColumns = selectedCourseId
    ? ["Datum", "Zeit", "Teilnehmer", "Beschreibung"]
    : ["Datum", "Zeit", "Fach", "Teilnehmer", "Beschreibung"];

  const gridCols = selectedCourseId
    ? "grid-cols-[140px,100px,200px,1fr,auto]"
    : "grid-cols-[140px,100px,180px,200px,1fr,auto]";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,280px),minmax(0,1fr)]">
        <CourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          onCourseChange={onCourseChange}
        />
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Coaching-Slots suchen
          </label>
          <Input
            type="text"
            placeholder="Beschreibung, Teilnehmer oder Fach durchsuchen..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 flex-1">
          Coaching-Slots
        </h2>
        <Button
          size="sm"
          className="h-8 px-2 sm:px-3 text-xs shrink-0 w-full sm:w-auto"
          icon={Plus}
          iconPosition="left"
          onClick={onCreate}
        >
          Neuer Slot
        </Button>
      </div>

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
              showCourse={!selectedCourseId}
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
              showCourse={!selectedCourseId}
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
