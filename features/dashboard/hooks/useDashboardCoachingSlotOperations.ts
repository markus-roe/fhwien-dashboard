import { useCallback } from "react";
import type { CoachingSlot, CreateCoachingSlotRequest, UpdateCoachingSlotRequest } from "@/shared/lib/api-types";
import type { CreateCoachingSlotFormData } from "@/features/coaching/types";

type UseDashboardCoachingSlotOperationsProps = {
  createSlot: (data: CreateCoachingSlotRequest) => Promise<CoachingSlot>;
  updateSlot: (id: number, data: UpdateCoachingSlotRequest) => Promise<CoachingSlot>;
  deleteSlot: (id: number) => Promise<void>;
};

export function useDashboardCoachingSlotOperations({
  createSlot,
  updateSlot,
  deleteSlot,
}: UseDashboardCoachingSlotOperationsProps) {
  const handleCreateCoaching = useCallback(
    async (data: CreateCoachingSlotRequest) => {
      try {
        await createSlot({
          courseId: data.courseId,
          date: data.date as Date,
          time: data.time,
          endTime: data.endTime,
          maxParticipants: data.maxParticipants as number,
          participants: data.participants,
          description: data.description as string,
        });
      } catch (error) {
        console.error("Failed to create coaching slot:", error);
        throw error;
      }
    },
    [createSlot]
  );

  const handleSaveCoaching = useCallback(
    async (
      editingSlot: CoachingSlot | null,
      data: CreateCoachingSlotFormData
    ) => {
      try {
        if (editingSlot) {
          await updateSlot(editingSlot.id, {
            courseId: data.courseId,
            date: data.date,
            time: data.time,
            endTime: data.endTime,
            maxParticipants: data.maxParticipants,
            participants: data.participantIds.map((id) => ({ id })),
            description: data.description,
          });
        } else {
          await handleCreateCoaching({
            courseId: data.courseId,
            date: data.date as Date,
            time: data.time,
            endTime: data.endTime,
            maxParticipants: data.maxParticipants as number,
            participants: data.participantIds.map((id) => ({ id })),
            description: data.description as string,
          });
        }
      } catch (error) {
        console.error("Failed to save coaching slot:", error);
        throw error;
      }
    },
    [updateSlot, handleCreateCoaching]
  );

  const handleDeleteCoaching = useCallback(
    async (slotId: number) => {
      try {
        await deleteSlot(slotId);
      } catch (error) {
        console.error("Failed to delete coaching slot:", error);
        throw error;
      }
    },
    [deleteSlot]
  );

  return {
    handleCreateCoaching,
    handleSaveCoaching,
    handleDeleteCoaching,
  };
}
