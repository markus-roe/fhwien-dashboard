"use client";

import { useMemo, useState } from "react";
import { type CoachingSlot, currentUser } from "@/data/mockData";
import { redirect } from "next/navigation";
import { useCoachingSlots } from "@/hooks/useCoachingSlots";
import { useUsers } from "@/hooks/useUsers";
import { useCourses } from "@/hooks/useCourses";
import { useDashboardTabs } from "@/hooks/useDashboardTabs";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CoachingSlotsTab } from "@/components/dashboard/CoachingSlotsTab";
import { CreateCoachingSlotDialog } from "@/components/coaching/CreateCoachingSlotDialog";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function CoachingsPage() {
  if (currentUser.role !== "professor" && currentUser.name !== "Markus") {
    redirect("/schedule");
  }

  const {
    slots: allCoachingSlots,
    createSlot: createCoachingSlot,
    updateSlot: updateCoachingSlot,
    deleteSlot: deleteCoachingSlot,
  } = useCoachingSlots();
  const { users: allUsers } = useUsers();
  const { courses: mockCourses } = useCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(
    null
  );
  const [coachingSlotSearch, setCoachingSlotSearch] = useState("");
  const [isCreateCoachingOpen, setIsCreateCoachingOpen] = useState(false);
  const [editingCoachingSlot, setEditingCoachingSlot] =
    useState<CoachingSlot | null>(null);
  const [coachingSlotToDelete, setCoachingSlotToDelete] =
    useState<CoachingSlot | null>(null);

  const coachingSlots = useMemo(() => {
    let filtered = allCoachingSlots;

    if (selectedCourseId) {
      filtered = filtered.filter((slot) => slot.courseId === selectedCourseId);
    }

    if (coachingSlotSearch.trim()) {
      const query = coachingSlotSearch.toLowerCase();
      filtered = filtered.filter((slot) => {
        const course = mockCourses.find((c) => c.id === slot.courseId);
        return (
          slot.description?.toLowerCase().includes(query) ||
          course?.title.toLowerCase().includes(query) ||
          slot.participants.some((p) => p.toLowerCase().includes(query)) ||
          false
        );
      });
    }

    return filtered;
  }, [allCoachingSlots, selectedCourseId, coachingSlotSearch, mockCourses]);

  const handleCreateCoaching = async (data: {
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
      await createCoachingSlot({
        courseId: data.courseId,
        date: data.date,
        time: data.time,
        endTime: data.endTime,
        maxParticipants: data.maxParticipants,
        participants: data.participants,
        description: data.description,
      });
    } catch (error) {
      console.error("Failed to create coaching slot:", error);
    }
  };

  const handleOpenEditCoaching = (slot: CoachingSlot) => {
    setEditingCoachingSlot(slot);
    setIsCreateCoachingOpen(true);
  };

  const handleSaveCoaching = async (data: {
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
      if (editingCoachingSlot) {
        await updateCoachingSlot(editingCoachingSlot.id, {
          courseId: data.courseId,
          date: data.date,
          time: data.time,
          endTime: data.endTime,
          maxParticipants: data.maxParticipants,
          participants: data.participants,
          description: data.description,
        });
        setEditingCoachingSlot(null);
      } else {
        await handleCreateCoaching(data);
      }
      setIsCreateCoachingOpen(false);
    } catch (error) {
      console.error("Failed to save coaching slot:", error);
    }
  };

  const handleDeleteCoaching = async (slotId: string) => {
    try {
      await deleteCoachingSlot(slotId);
      setCoachingSlotToDelete(null);
    } catch (error) {
      console.error("Failed to delete coaching slot:", error);
    }
  };

  const dashboardTabs = useDashboardTabs();

  return (
    <>
      <DashboardLayout activeTab="coachings" tabs={dashboardTabs}>
        <CoachingSlotsTab
          slots={coachingSlots}
          courses={mockCourses}
          selectedCourseId={selectedCourseId}
          onCourseChange={setSelectedCourseId}
          onEdit={handleOpenEditCoaching}
          onDelete={setCoachingSlotToDelete}
          onCreate={() => {
            setEditingCoachingSlot(null);
            setIsCreateCoachingOpen(true);
          }}
          search={coachingSlotSearch}
          onSearchChange={setCoachingSlotSearch}
        />
      </DashboardLayout>

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
        onSubmit={handleSaveCoaching}
        mode={editingCoachingSlot ? "edit" : "create"}
        initialData={editingCoachingSlot || undefined}
      />

      <DeleteConfirmationDialog
        isOpen={!!coachingSlotToDelete}
        onClose={() => setCoachingSlotToDelete(null)}
        onConfirm={() => {
          if (coachingSlotToDelete) {
            handleDeleteCoaching(coachingSlotToDelete.id);
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

