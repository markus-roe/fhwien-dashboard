"use client";

import { useState } from "react";
import { type CoachingSlot, currentUser } from "@/shared/data/mockData";
import { redirect } from "next/navigation";
import { useCoachingSlots } from "@/features/coaching/hooks/useCoachingSlots";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useCourses } from "@/shared/hooks/useCourses";
import { useDashboardCoachingSlotFilters } from "@/features/dashboard/hooks/useDashboardCoachingSlotFilters";
import { useDashboardCoachingSlotOperations } from "@/features/dashboard/hooks/useDashboardCoachingSlotOperations";
import { CoachingSlotsTab } from "@/features/dashboard/components/CoachingSlotsTab";
import { CreateCoachingSlotDialog } from "@/features/coaching/components/CreateCoachingSlotDialog";
import { DeleteConfirmationDialog } from "@/shared/components/ui/DeleteConfirmationDialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function CoachingsPage() {
  if (currentUser.role !== "professor" && currentUser.name !== "Markus") {
    redirect("/schedule");
  }

  const {
    slots: allCoachingSlots,
    loading: slotsLoading,
    createSlot: createCoachingSlot,
    updateSlot: updateCoachingSlot,
    deleteSlot: deleteCoachingSlot,
  } = useCoachingSlots();
  const { users: allUsers, loading: usersLoading } = useUsers();
  const { courses: mockCourses, loading: coursesLoading } = useCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [coachingSlotSearch, setCoachingSlotSearch] = useState("");
  const [isCreateCoachingOpen, setIsCreateCoachingOpen] = useState(false);
  const [editingCoachingSlot, setEditingCoachingSlot] =
    useState<CoachingSlot | null>(null);
  const [coachingSlotToDelete, setCoachingSlotToDelete] =
    useState<CoachingSlot | null>(null);

  // Filtering logic
  const { filteredSlots: coachingSlots } = useDashboardCoachingSlotFilters({
    allSlots: allCoachingSlots,
    courses: mockCourses,
    selectedCourseId,
    searchQuery: coachingSlotSearch,
  });

  // Operations
  const { handleSaveCoaching, handleDeleteCoaching } =
    useDashboardCoachingSlotOperations({
      createSlot: createCoachingSlot,
      updateSlot: updateCoachingSlot,
      deleteSlot: deleteCoachingSlot,
    });

  const handleOpenEditCoaching = (slot: CoachingSlot) => {
    setEditingCoachingSlot(slot);
    setIsCreateCoachingOpen(true);
  };

  const handleSaveCoachingWrapper = async (data: {
    courseId: string;
    date: Date;
    time: string;
    endTime: string;
    location: string;
    locationType: "online" | "on-campus";
    maxParticipants: number;
    participants: string[];
    description?: string;
  }) => {
    try {
      await handleSaveCoaching(editingCoachingSlot, data);
      setEditingCoachingSlot(null);
      setIsCreateCoachingOpen(false);
    } catch (error) {}
  };

  const handleDeleteCoachingWrapper = async (slotId: string) => {
    try {
      await handleDeleteCoaching(slotId);
      setCoachingSlotToDelete(null);
    } catch (error) {}
  };

  return (
    <>
      <CoachingSlotsTab
        slots={coachingSlots}
        courses={mockCourses}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
        onEdit={handleOpenEditCoaching}
        onDelete={(slot) => {
          setCoachingSlotToDelete(slot);
        }}
        onCreate={() => {
          setEditingCoachingSlot(null);
          setIsCreateCoachingOpen(true);
        }}
        search={coachingSlotSearch}
        onSearchChange={setCoachingSlotSearch}
        loading={slotsLoading || coursesLoading || usersLoading}
      />

      <CreateCoachingSlotDialog
        isOpen={isCreateCoachingOpen}
        onOpenChange={(open) => {
          setIsCreateCoachingOpen(open);
          if (!open) {
            setEditingCoachingSlot(null);
          }
        }}
        courses={mockCourses}
        users={allUsers}
        onSubmit={handleSaveCoachingWrapper}
        mode={editingCoachingSlot ? "edit" : "create"}
        initialData={editingCoachingSlot || undefined}
      />

      <DeleteConfirmationDialog
        isOpen={!!coachingSlotToDelete}
        onClose={() => setCoachingSlotToDelete(null)}
        onConfirm={() => {
          if (coachingSlotToDelete) {
            handleDeleteCoachingWrapper(coachingSlotToDelete.id);
          }
        }}
        title="Coaching-Slot löschen?"
        description="Möchten Sie den folgenden Coaching-Slot wirklich löschen?"
        itemName={
          coachingSlotToDelete
            ? `${coachingSlotToDelete.participants.length}/${coachingSlotToDelete.maxParticipants} Teilnehmer`
            : undefined
        }
        itemDetails={
          coachingSlotToDelete
            ? format(coachingSlotToDelete.date, "d. MMM yyyy, EEEE HH:mm", {
                locale: de,
              }) +
              (coachingSlotToDelete.endTime
                ? ` - ${coachingSlotToDelete.endTime}`
                : "")
            : undefined
        }
      />
    </>
  );
}
