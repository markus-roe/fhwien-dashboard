"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type Session,
  type CoachingSlot,
  type Group,
  type User,
  type Program,
  currentUser,
} from "@/data/mockData";
import { useSessions } from "@/hooks/useSessions";
import { useCoachingSlots } from "@/hooks/useCoachingSlots";
import { useGroups } from "@/hooks/useGroups";
import { useUsers } from "@/hooks/useUsers";
import { useCourses } from "@/hooks/useCourses";
import { Card, CardContent } from "@/components/ui/Card";
import { Sidebar } from "@/components/layout/Sidebar";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { redirect } from "next/navigation";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import {
  EditSessionDialog,
  type EditSessionFormState,
} from "@/components/dashboard/EditSessionDialog";
import {
  CreateGroupDialog,
  type CreateGroupFormData,
} from "@/components/groups/CreateGroupDialog";
import {
  CreateStudentDialog,
  type CreateStudentFormData,
} from "@/components/dashboard/CreateStudentDialog";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";
import { CreateCoachingSlotDialog } from "@/components/coaching/CreateCoachingSlotDialog";
import { SessionsTab } from "@/components/dashboard/SessionsTab";
import { CoachingSlotsTab } from "@/components/dashboard/CoachingSlotsTab";
import { GroupsTab } from "@/components/dashboard/GroupsTab";
import { UsersTab } from "@/components/dashboard/UsersTab";
import { calculateDuration } from "@/lib/dashboardUtils";

export default function DashboardPage() {
  if (currentUser.role !== "professor" && currentUser.name !== "Markus") {
    redirect("/schedule");
  }

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeDashboardTab, setActiveDashboardTab] = useState<
    "lvs" | "coachings" | "groups" | "users"
  >("lvs");
  const [userSearch, setUserSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<Program | "all">("all");
  const [sessionSearch, setSessionSearch] = useState("");
  const [coachingSlotSearch, setCoachingSlotSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");

  // Always fetch all data, filter client-side
  const {
    sessions: allSessions,
    loading: sessionsLoading,
    createSession,
    updateSession,
    deleteSession,
  } = useSessions();

  const {
    slots: allCoachingSlots,
    loading: coachingSlotsLoading,
    createSlot: createCoachingSlot,
    updateSlot: updateCoachingSlot,
    deleteSlot: deleteCoachingSlot,
  } = useCoachingSlots();

  const {
    groups: allGroups,
    loading: groupsLoading,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useGroups();

  const {
    users: allUsers,
    loading: usersLoading,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  const { courses: mockCourses, loading: coursesLoading } = useCourses();

  // Filter data client-side
  const sessions = useMemo(() => {
    let filtered = allSessions;

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter(
        (session) => session.courseId === selectedCourseId
      );
    }

    // Filter by search
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

  const coachingSlots = useMemo(() => {
    let filtered = allCoachingSlots;

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((slot) => slot.courseId === selectedCourseId);
    }

    // Filter by search
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

  const groups = useMemo(() => {
    let filtered = allGroups;

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter(
        (group) => group.courseId === selectedCourseId
      );
    }

    // Filter by search
    if (groupSearch.trim()) {
      const query = groupSearch.toLowerCase();
      filtered = filtered.filter((group) => {
        const course = mockCourses.find((c) => c.id === group.courseId);
        return (
          group.name.toLowerCase().includes(query) ||
          group.description?.toLowerCase().includes(query) ||
          course?.title.toLowerCase().includes(query) ||
          group.members.some((m) => m.toLowerCase().includes(query)) ||
          false
        );
      });
    }

    return filtered;
  }, [allGroups, selectedCourseId, groupSearch, mockCourses]);

  const users = useMemo(() => {
    let filtered = allUsers;

    // Filter by program
    if (programFilter !== "all") {
      filtered = filtered.filter((user) => user.program === programFilter);
    }

    // Filter by search
    if (userSearch.trim()) {
      const query = userSearch.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allUsers, programFilter, userSearch]);

  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    groups[0]?.id ?? ""
  );
  const [selectedUserId, setSelectedUserId] = useState<string>(
    users[0]?.id ?? ""
  );

  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editFormState, setEditFormState] =
    useState<EditSessionFormState | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [coachingSlotToDelete, setCoachingSlotToDelete] =
    useState<CoachingSlot | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const [isCreateCoachingOpen, setIsCreateCoachingOpen] = useState(false);
  const [editingCoachingSlot, setEditingCoachingSlot] =
    useState<CoachingSlot | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  const selectedCourse = useMemo(
    () => mockCourses.find((c) => c.id === selectedCourseId) || null,
    [selectedCourseId, mockCourses]
  );

  // These are now just aliases for the filtered data
  const courseSessions = sessions;
  const courseCoachingSlots = coachingSlots;
  const courseGroups = groups;
  const filteredUsers = users;

  const assignableGroups = courseGroups.length > 0 ? courseGroups : allGroups;

  useEffect(() => {
    if (
      assignableGroups.length > 0 &&
      !assignableGroups.some((group) => group.id === selectedGroupId)
    ) {
      setSelectedGroupId(assignableGroups[0].id);
    }
  }, [assignableGroups, selectedGroupId]);

  useEffect(() => {
    if (!users.some((user) => user.id === selectedUserId) && users[0]) {
      setSelectedUserId(users[0].id);
    }
  }, [selectedUserId, users]);

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
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSaveSession = async () => {
    if (!editFormState || !editFormState.courseId) return;

    try {
      if (editingSession) {
        // Update bestehende Session
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
        // Neue Session anlegen
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
        // Update existing coaching slot
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
        // Create new coaching slot
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

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId);
      setGroupToDelete(null);
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  const handleAssignUserToGroup = async (groupId: string, userId: string) => {
    if (!groupId || !userId) return;

    try {
      // Note: The API uses currentUser, so we need to use join endpoint
      // For now, we'll use updateGroup to add the user
      // Use allGroups to find the group even if it's filtered out
      const group = allGroups.find((g) => g.id === groupId);
      // Use allUsers to find the user even if it's filtered out
      const user = allUsers.find((u) => u.id === userId);
      if (!group || !user) return;

      const isAlreadyMember = group.members.includes(user.name);
      const isFull =
        group.maxMembers && group.members.length >= group.maxMembers;
      if (isAlreadyMember || isFull) return;

      await updateGroup(groupId, {
        members: [...group.members, user.name],
      });
    } catch (error) {
      console.error("Failed to assign user to group:", error);
    }
  };

  const handleRemoveUserFromGroup = async (groupId: string, member: string) => {
    try {
      // Use allGroups to find the group even if it's filtered out
      const group = allGroups.find((g) => g.id === groupId);
      if (!group) return;

      await updateGroup(groupId, {
        members: group.members.filter((existing) => existing !== member),
      });
    } catch (error) {
      console.error("Failed to remove user from group:", error);
    }
  };

  const handleCreateGroup = async (data: CreateGroupFormData) => {
    const courseId = data.courseId || selectedCourseId;
    if (!courseId || !data.name.trim()) return;

    try {
      await createGroup({
        courseId,
        name: data.name,
        description: data.description,
        maxMembers: data.maxMembers,
      });
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleCreateOrEditStudent = async (data: CreateStudentFormData) => {
    try {
      if (editingStudent) {
        // Update existing user
        await updateUser(editingStudent.id, {
          name: data.name,
          email: data.email,
          program: data.program,
          initials: data.initials,
          role: "student",
        });
        setEditingStudent(null);
      } else {
        // Create new user
        await createUser({
          name: data.name,
          email: data.email,
          program: data.program,
          initials: data.initials,
          role: "student",
        });
      }
    } catch (error) {
      console.error("Failed to save student:", error);
    }
  };

  const handleOpenEditStudent = (user: User) => {
    setEditingStudent(user);
    setIsCreateStudentOpen(true);
  };

  const handleDeleteStudent = async (userId: string) => {
    try {
      await deleteUser(userId);
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  const dashboardTabs = [
    {
      value: "lvs",
      label: "Lehrveranstaltungen",
      badge: allSessions.length > 0 ? allSessions.length : undefined,
    },
    {
      value: "coachings",
      label: "Coachings",
      badge: allCoachingSlots.length > 0 ? allCoachingSlots.length : undefined,
    },
    {
      value: "groups",
      label: "Gruppen",
      badge: allGroups.length > 0 ? allGroups.length : undefined,
    },
    {
      value: "users",
      label: "Studenten",
      badge: allUsers.length > 0 ? allUsers.length : undefined,
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
          <Sidebar
            showCalendar={true}
            showNextUpCard={false}
            emptyMessage="Keine anstehenden Termine."
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-3">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                  Dashboard
                </h1>
              </div>
              <SegmentedTabs
                value={activeDashboardTab}
                onChange={(value) =>
                  setActiveDashboardTab(
                    value as "lvs" | "coachings" | "groups" | "users"
                  )
                }
                options={dashboardTabs}
                className="mb-4"
              />
              <div className="flex-1 min-w-0 space-y-5">
                {activeDashboardTab === "lvs" && (
                  <SessionsTab
                    sessions={courseSessions}
                    courses={mockCourses}
                    selectedCourseId={selectedCourseId}
                    onCourseChange={setSelectedCourseId}
                    onEdit={handleOpenEditSession}
                    onDelete={setSessionToDelete}
                    onCreate={handleOpenCreateSession}
                    search={sessionSearch}
                    onSearchChange={setSessionSearch}
                  />
                )}

                {activeDashboardTab === "coachings" && (
                  <CoachingSlotsTab
                    slots={courseCoachingSlots}
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
                )}

                {activeDashboardTab === "groups" && (
                  <GroupsTab
                    groups={courseGroups}
                    courses={mockCourses}
                    users={users}
                    selectedCourseId={selectedCourseId}
                    onCourseChange={setSelectedCourseId}
                    onDelete={handleDeleteGroup}
                    onAssignUser={handleAssignUserToGroup}
                    onRemoveUser={handleRemoveUserFromGroup}
                    onCreate={() => setIsCreateGroupOpen(true)}
                    search={groupSearch}
                    onSearchChange={setGroupSearch}
                  />
                )}

                {activeDashboardTab === "users" && (
                  <UsersTab
                    users={users}
                    filteredUsers={filteredUsers}
                    programFilter={programFilter}
                    userSearch={userSearch}
                    onProgramFilterChange={setProgramFilter}
                    onUserSearchChange={setUserSearch}
                    onEdit={handleOpenEditStudent}
                    onDelete={setStudentToDelete}
                    onCreate={() => {
                      setEditingStudent(null);
                      setIsCreateStudentOpen(true);
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

      <CreateCoachingSlotDialog
        isOpen={isCreateCoachingOpen}
        onOpenChange={(open) => {
          setIsCreateCoachingOpen(open);
          if (!open) {
            setEditingCoachingSlot(null);
          }
        }}
        courses={mockCourses}
        users={users}
        onSubmit={handleSaveCoaching}
        mode={editingCoachingSlot ? "edit" : "create"}
        initialData={editingCoachingSlot || undefined}
      />

      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        courses={mockCourses}
        defaultCourseId={selectedCourseId}
        onSubmit={handleCreateGroup}
      />

      <CreateStudentDialog
        isOpen={isCreateStudentOpen}
        onOpenChange={(open) => {
          setIsCreateStudentOpen(open);
          if (!open) {
            setEditingStudent(null);
          }
        }}
        onSubmit={handleCreateOrEditStudent}
        mode={editingStudent ? "edit" : "create"}
        initialData={editingStudent || undefined}
      />

      {/* Bestätigungsdialog für Löschen eines LV-Termins */}
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

      {/* Bestätigungsdialog für Löschen eines Studenten */}
      <DeleteConfirmationDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            handleDeleteStudent(studentToDelete.id);
          }
        }}
        title="Student löschen?"
        description="Möchten Sie den folgenden Studenten wirklich löschen?"
        itemName={studentToDelete?.name}
        itemDetails={studentToDelete?.email}
      />

      {/* Bestätigungsdialog für Löschen eines Coaching-Slots */}
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

      {/* Bestätigungsdialog für Löschen einer Gruppe */}
      <DeleteConfirmationDialog
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => {
          if (groupToDelete) {
            handleDeleteGroup(groupToDelete.id);
          }
        }}
        title="Gruppe löschen?"
        description="Möchten Sie die folgende Gruppe wirklich löschen?"
        itemName={groupToDelete?.name}
        itemDetails={
          groupToDelete
            ? `${
                mockCourses.find((c) => c.id === groupToDelete.courseId)
                  ?.title ?? "Kurs"
              } • ${groupToDelete.members.length} Mitglieder`
            : undefined
        }
      />
    </div>
  );
}
