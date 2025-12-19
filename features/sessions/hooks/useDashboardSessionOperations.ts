import { useCallback } from "react";
import type { Session, Material } from "@/shared/data/mockData";
import type { EditSessionFormState } from "@/features/dashboard/types";

type UseDashboardSessionOperationsProps = {
  createSession: (data: {
    courseId: string;
    type: "lecture" | "workshop" | "coaching";
    title: string;
    date: Date;
    time: string;
    endTime: string;
    location: string;
    locationType: "online" | "on-campus";
    attendance: "mandatory" | "optional";
    objectives: string[];
    materials: Material[];
  }) => Promise<Session>;
  updateSession: (
    id: string,
    data: {
      courseId: string;
      title: string;
      date: Date;
      time: string;
      endTime: string;
      location: string;
      locationType: "online" | "on-campus";
      attendance: "mandatory" | "optional";
    }
  ) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
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
            materials: [] as Material[],
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
    async (sessionId: string) => {
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
