import { useCallback } from "react";
import type { CoachingSlot } from "@/data/mockData";

type UseCoachingSlotOperationsProps = {
  bookSlot: (slotId: string) => Promise<CoachingSlot>;
  cancelBooking: (slotId: string) => Promise<CoachingSlot>;
  deleteSlot: (slotId: string) => Promise<void>;
};

export function useCoachingSlotOperations({
  bookSlot,
  cancelBooking,
  deleteSlot,
}: UseCoachingSlotOperationsProps) {
  const handleBookSlot = useCallback(
    async (slotId: string) => {
      try {
        await bookSlot(slotId);
      } catch (error) {
        console.error("Failed to book slot:", error);
        throw error;
      }
    },
    [bookSlot]
  );

  const handleCancelBooking = useCallback(
    async (slotId: string) => {
      try {
        await cancelBooking(slotId);
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        throw error;
      }
    },
    [cancelBooking]
  );

  const handleDeleteSlot = useCallback(
    async (slotId: string) => {
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

