"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { type Session } from "@/shared/lib/api-types";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!userLoading && currentUser && !(currentUser.role === "professor" || currentUser.role === "admin")) {
      router.push("/schedule");
    }
  }, [currentUser, userLoading, router]);

  if (userLoading || !currentUser) {
    return <div className="p-4">Laden...</div>;
  }


  const {
    sessions: allSessions,
    loading: sessionsLoading,
    createSession,
    updateSession,
    deleteSession,
  } = useSessions();
  const { courses, loading: coursesLoading } = useCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editFormState, setEditFormState] =
    useState<EditSessionFormState | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  // Filtering logic
  const { filteredSessions: sessions } = useDashboardSessionFilters({
    allSessions,
    courses,
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
      date: new Date(session.date),
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
      courses.find((c) => c.id === selectedCourseId) ?? null;

    setEditingSession(null);
    setEditFormState({
      courseId: selectedCourseId,
      title: selectedCourse?.title ? selectedCourse?.title + " LV" : "",
      date: new Date(),
      time: "08:30",
      endTime: "10:00",
      location: "",
      locationType: "on_campus",
      attendance: "mandatory",
      notes: "",
    });
  };

  const handleDeleteSessionWrapper = async (sessionId: number) => {
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
        courses={courses}
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
          courses={courses}
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
