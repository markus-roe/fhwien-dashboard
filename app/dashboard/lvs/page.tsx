"use client";

import { useMemo, useState } from "react";
import { type Session, currentUser } from "@/data/mockData";
import { redirect } from "next/navigation";
import { useSessions } from "@/hooks/useSessions";
import { useCourses } from "@/hooks/useCourses";
import { SessionsTab } from "@/components/dashboard/SessionsTab";
import {
  EditSessionDialog,
  type EditSessionFormState,
} from "@/components/dashboard/EditSessionDialog";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function LVsPage() {
  if (currentUser.role !== "professor" && currentUser.name !== "Markus") {
    redirect("/schedule");
  }

  const {
    sessions: allSessions,
    loading: sessionsLoading,
    createSession,
    updateSession,
    deleteSession,
  } = useSessions();
  const { courses: mockCourses, loading: coursesLoading } = useCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editFormState, setEditFormState] =
    useState<EditSessionFormState | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  const sessions = useMemo(() => {
    let filtered = allSessions;

    if (selectedCourseId) {
      filtered = filtered.filter(
        (session) => session.courseId === selectedCourseId
      );
    }

    if (sessionSearch.trim()) {
      const query = sessionSearch.toLowerCase();
      filtered = filtered.filter((session) => {
        const course = mockCourses.find((c) => c.id === session.courseId);
        return (
          session.title.toLowerCase().includes(query) ||
          session.location.toLowerCase().includes(query) ||
          course?.title.toLowerCase().includes(query) ||
          false
        );
      });
    }

    return filtered;
  }, [allSessions, selectedCourseId, sessionSearch, mockCourses]);

  const handleOpenEditSession = (session: Session) => {
    setEditingSession(session);
    setEditFormState({
      courseId: session.courseId,
      title: session.title,
      date: session.date,
      time: session.time,
      endTime: session.endTime,
      location: session.location,
      locationType: session.locationType,
      attendance: session.attendance,
      notes: "",
    });
  };

  const handleOpenCreateSession = () => {
    const selectedCourse =
      mockCourses.find((c) => c.id === selectedCourseId) ?? null;

    setEditingSession(null);
    setEditFormState({
      courseId: selectedCourseId,
      title: selectedCourse?.title ? selectedCourse?.title + " LV" : "",
      date: new Date(),
      time: "08:30",
      endTime: "10:00",
      location: "",
      locationType: "on-campus",
      attendance: "mandatory",
      notes: "",
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      setSessionToDelete(null);
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSaveSession = async () => {
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

      setEditingSession(null);
      setEditFormState(null);
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  };

  return (
    <>
      <SessionsTab
        sessions={sessions}
        courses={mockCourses}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
        onEdit={handleOpenEditSession}
        onDelete={setSessionToDelete}
        onCreate={handleOpenCreateSession}
        search={sessionSearch}
        onSearchChange={setSessionSearch}
        loading={sessionsLoading || coursesLoading}
      />

      {editFormState && (
        <EditSessionDialog
          formState={editFormState}
          onFormStateChange={setEditFormState}
          onClose={() => {
            setEditingSession(null);
            setEditFormState(null);
          }}
          onSave={handleSaveSession}
          mode={editingSession ? "edit" : "create"}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={() => {
          if (sessionToDelete) {
            handleDeleteSession(sessionToDelete.id);
          }
        }}
        title="LV-Termin löschen?"
        description="Möchten Sie den folgenden Termin wirklich löschen?"
        itemName={sessionToDelete?.title}
        itemDetails={
          sessionToDelete
            ? format(sessionToDelete.date, "d. MMM yyyy, EEEE HH:mm", {
                locale: de,
              })
            : undefined
        }
      />
    </>
  );
}
