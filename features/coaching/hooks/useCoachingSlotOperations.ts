import { useCallback } from "react";
import type { CoachingSlot } from "@/shared/lib/api-types";
import { currentUser } from "@/shared/data/mockData";

type UseCoachingSlotOperationsProps = {
  bookSlot: (slotId: number, userId: number) => Promise<CoachingSlot>;
  cancelBooking: (slotId: number, userId: number) => Promise<CoachingSlot>;
  deleteSlot: (slotId: number) => Promise<void>;
};

export function useCoachingSlotOperations({
  bookSlot,
  cancelBooking,
  deleteSlot,
}: UseCoachingSlotOperationsProps) {
  const handleBookSlot = useCallback(
    async (slotId: number) => {
      try {
        await bookSlot(slotId, currentUser.id);
      } catch (error) {
        console.error("Failed to book slot:", error);
        throw error;
      }
    },
    [bookSlot, currentUser.id]
  );

  const handleCancelBooking = useCallback(
    async (slotId: number) => {
      try {
        await cancelBooking(slotId, currentUser.id);
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        throw error;
      }
    },
    [cancelBooking, currentUser.id]
  );

  const handleDeleteSlot = useCallback(
    async (slotId: number) => {
      try {
        await deleteSlot(slotId);
      } catch (error) {
        console.error("Failed to delete slot:", error);
        throw error;
      }
    },
    [deleteSlot]
  );

  return {
    handleBookSlot,
    handleCancelBooking,
    handleDeleteSlot,
  };
}
