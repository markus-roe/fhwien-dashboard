"use client";

import { useState } from "react";
import { type Session, currentUser } from "@/shared/data/mockData";
import { redirect } from "next/navigation";
import { useSessions } from "@/features/sessions/hooks/useSessions";
import { useCourses } from "@/shared/hooks/useCourses";
import { useDashboardSessionFilters } from "@/features/sessions/hooks/useDashboardSessionFilters";
import { useDashboardSessionOperations } from "@/features/sessions/hooks/useDashboardSessionOperations";
import { SessionsTab } from "@/features/dashboard/components/SessionsTab";
import { EditSessionDialog } from "@/features/dashboard/components/EditSessionDialog";
import type { EditSessionFormState } from "@/features/dashboard/types";
import { DeleteConfirmationDialog } from "@/shared/components/ui/DeleteConfirmationDialog";
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

  // Filtering logic
  const { filteredSessions: sessions } = useDashboardSessionFilters({
    allSessions,
    courses: mockCourses,
    selectedCourseId,
    searchQuery: sessionSearch,
  });

  // Operations
  const { handleSaveSession, handleDeleteSession } =
    useDashboardSessionOperations({
      createSession,
      updateSession,
      deleteSession,
    });

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

  const handleDeleteSessionWrapper = async (sessionId: string) => {
    try {
      await handleDeleteSession(sessionId);
      setSessionToDelete(null);
    } catch (error) {
      // Error already logged in hook
    }
  };

  const handleSaveSessionWrapper = async () => {
    try {
      await handleSaveSession(editingSession, editFormState);
      setEditingSession(null);
      setEditFormState(null);
    } catch (error) {
      // Error already logged in hook
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
          onSave={handleSaveSessionWrapper}
          mode={editingSession ? "edit" : "create"}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={() => {
          if (sessionToDelete) {
            handleDeleteSessionWrapper(sessionToDelete.id);
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
