"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { type CoachingSlot, CreateCoachingSlotRequest, UpdateCoachingSlotRequest } from "@/shared/lib/api-types";
import { useRouter } from "next/navigation";
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
import { CreateCoachingSlotFormData } from "@/features/coaching/types";

export default function CoachingsPage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  // All hooks must be called before any conditional returns
  const {
    slots: allCoachingSlots,
    loading: slotsLoading,
    createSlot: createCoachingSlot,
    updateSlot: updateCoachingSlot,
    deleteSlot: deleteCoachingSlot,
  } = useCoachingSlots();
  const { users: allUsers, loading: usersLoading } = useUsers();
  const { courses, loading: coursesLoading } = useCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [coachingSlotSearch, setCoachingSlotSearch] = useState("");
  const [isCreateCoachingOpen, setIsCreateCoachingOpen] = useState(false);
  const [editingCoachingSlot, setEditingCoachingSlot] =
    useState<CoachingSlot | null>(null);
  const [coachingSlotToDelete, setCoachingSlotToDelete] =
    useState<CoachingSlot | null>(null);

  // Filtering logic
  const { filteredSlots: coachingSlots } = useDashboardCoachingSlotFilters({
    allSlots: allCoachingSlots,
    courses,
    selectedCourseId,
    searchQuery: coachingSlotSearch,
  });

  // Operations
  const { handleSaveCoaching, handleDeleteCoaching } =
    useDashboardCoachingSlotOperations({
      createSlot: (data: CreateCoachingSlotRequest) => createCoachingSlot(data),
      updateSlot: (id: number, data: UpdateCoachingSlotRequest) => updateCoachingSlot(id, data),
      deleteSlot: (id: number) => deleteCoachingSlot(id),
    });

    useEffect(() => {
      if (!userLoading && currentUser && !(currentUser.role === "professor" || currentUser.role === "admin")) {
        router.push("/schedule");
      }
    }, [currentUser, userLoading, router]);
  
    if (userLoading || !currentUser) {
      return <div className="p-4">Laden...</div>;
    }

  const handleOpenEditCoaching = (slot: CoachingSlot) => {
    setEditingCoachingSlot(slot);
    setIsCreateCoachingOpen(true);
  };

  const handleSaveCoachingWrapper = async (data: CreateCoachingSlotFormData) => {
    try {
      await handleSaveCoaching(editingCoachingSlot, data);
      setEditingCoachingSlot(null);
      setIsCreateCoachingOpen(false);
    } catch (error) {}
  };

  const handleDeleteCoachingWrapper = async (slotId: number) => {
    try {
      await handleDeleteCoaching(slotId);
      setCoachingSlotToDelete(null);
    } catch (error) {}
  };

  return (
    <>
      <CoachingSlotsTab
        slots={coachingSlots}
        courses={courses}
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
        courses={courses}
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
