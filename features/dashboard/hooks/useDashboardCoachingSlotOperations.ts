import { useCallback } from "react";
import type { CoachingSlot } from "@/shared/data/mockData";

type UseDashboardCoachingSlotOperationsProps = {
  createSlot: (data: {
    courseId: string;
    date: Date;
    time: string;
    endTime: string;
    maxParticipants: number;
    participants: string[];
    description?: string;
  }) => Promise<CoachingSlot>;
  updateSlot: (
    id: string,
    data: {
      courseId: string;
      date: Date;
      time: string;
      endTime: string;
      maxParticipants: number;
      participants: string[];
      description?: string;
    }
  ) => Promise<CoachingSlot>;
  deleteSlot: (id: string) => Promise<void>;
};

export function useDashboardCoachingSlotOperations({
  createSlot,
  updateSlot,
  deleteSlot,
}: UseDashboardCoachingSlotOperationsProps) {
  const handleCreateCoaching = useCallback(
    async (data: {
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
        await createSlot({
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
        throw error;
      }
    },
    [createSlot]
  );

  const handleSaveCoaching = useCallback(
    async (
      editingSlot: CoachingSlot | null,
      data: {
        courseId: string;
        date: Date;
        time: string;
        endTime: string;
        location: string;
        locationType: "online" | "on-campus";
        maxParticipants: number;
        participants: string[];
        description?: string;
      }
    ) => {
      try {
        if (editingSlot) {
          await updateSlot(editingSlot.id, {
            courseId: data.courseId,
            date: data.date,
            time: data.time,
            endTime: data.endTime,
            maxParticipants: data.maxParticipants,
            participants: data.participants,
            description: data.description,
          });
        } else {
          await handleCreateCoaching(data);
        }
      } catch (error) {
        console.error("Failed to save coaching slot:", error);
        throw error;
      }
    },
    [updateSlot, handleCreateCoaching]
  );

  const handleDeleteCoaching = useCallback(
    async (slotId: string) => {
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
