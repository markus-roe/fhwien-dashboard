import { useCallback } from "react";
import type { Session, Material, LocationType, SessionType, Attendance } from "@/shared/lib/api-types";
import type { EditSessionFormState } from "@/features/dashboard/types";

type UseDashboardSessionOperationsProps = {
  createSession: (data: {
    courseId: number;
    type: SessionType;
    title: string;
    date: Date;
    time: string;
    endTime: string;
    location: string;
    locationType: LocationType;
    attendance: Attendance;
    objectives: string[];
    materials: Material[];
  }) => Promise<Session>;
  updateSession: (
    id: number,
    data: {
      courseId?: number;
      title?: string;
      date?: Date;
      time?: string;
      endTime?: string;
      location?: string;
      locationType?: LocationType;
      attendance?: Attendance;
    }
  ) => Promise<Session>;
  deleteSession: (id: number) => Promise<void>;
};

export function useDashboardSessionOperations({
  createSession,
  updateSession,
  deleteSession,
}: UseDashboardSessionOperationsProps) {
  const handleSaveSession = useCallback(
    async (
      editingSession: Session | null,
      editFormState: EditSessionFormState | null
    ) => {
      if (!editFormState || !editFormState.courseId) return;

      try {
        if (editingSession) {
          await updateSession(editingSession.id, {
            courseId: editFormState.courseId,
            title: editFormState.title,
            date: editFormState.date,
            time: editFormState.time,
            endTime: editFormState.endTime,
            location: editFormState.location,
            locationType: editFormState.locationType,
            attendance: editFormState.attendance,
          });
        } else {
          await createSession({
            courseId: editFormState.courseId,
            type: "lecture",
            title: editFormState.title,
            date: editFormState.date,
            time: editFormState.time,
            endTime: editFormState.endTime,
            location: editFormState.location,
            locationType: editFormState.locationType,
            attendance: editFormState.attendance,
            objectives: [],
            materials: [],
          });
        }
      } catch (error) {
        console.error("Failed to save session:", error);
        throw error;
      }
    },
    [createSession, updateSession]
  );

  const handleDeleteSession = useCallback(
    async (sessionId: number) => {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error("Failed to delete session:", error);
        throw error;
      }
    },
    [deleteSession]
  );

  return {
    handleSaveSession,
    handleDeleteSession,
  };
}
