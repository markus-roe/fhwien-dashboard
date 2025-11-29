"use client";

import { useEffect, useMemo, useState } from "react";
import {
  mockSessions,
  mockCoachingSlots,
  mockCourses,
  mockGroups,
  mockUsers,
  type Session,
  type CoachingSlot,
  type Group,
  type User,
  type Program,
  currentUser,
} from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/Card";
import { Sidebar } from "@/components/layout/Sidebar";
import { Calendar, CalendarClock } from "lucide-react";
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
import { CourseSelector } from "@/components/dashboard/CourseSelector";
import { SessionsTab } from "@/components/dashboard/SessionsTab";
import { CoachingSlotsTab } from "@/components/dashboard/CoachingSlotsTab";
import { GroupsTab } from "@/components/dashboard/GroupsTab";
import { UsersTab } from "@/components/dashboard/UsersTab";
import { calculateDuration } from "@/lib/dashboardUtils";

export default function DashboardPage() {
  if (currentUser.role !== "professor" && currentUser.name !== "Markus") {
    redirect("/schedule");
  }

  const [sessions, setSessions] = useState<Session[]>(() => [...mockSessions]);
  const [coachingSlots, setCoachingSlots] = useState<CoachingSlot[]>(() => [
    ...mockCoachingSlots,
  ]);
  const [groups, setGroups] = useState<Group[]>(() => [...mockGroups]);
  const [users, setUsers] = useState<User[]>(() => [...mockUsers]);

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    mockGroups[0]?.id ?? ""
  );
  const [selectedUserId, setSelectedUserId] = useState<string>(
    mockUsers[0]?.id ?? ""
  );
  const [activeDashboardTab, setActiveDashboardTab] = useState<
    "lvs" | "coachings" | "groups" | "users"
  >("lvs");
  const [userSearch, setUserSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<Program | "all">("all");

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
    [selectedCourseId]
  );

  const courseSessions = useMemo(() => {
    const filtered = selectedCourseId
      ? sessions.filter((session) => session.courseId === selectedCourseId)
      : sessions;
    return filtered;
  }, [sessions, selectedCourseId]);

  const courseCoachingSlots = useMemo(() => {
    const filtered = selectedCourseId
      ? coachingSlots.filter((slot) => slot.courseId === selectedCourseId)
      : coachingSlots;
    return filtered;
  }, [coachingSlots, selectedCourseId]);

  const courseGroups = useMemo(() => {
    return selectedCourseId
      ? groups.filter((group) => group.courseId === selectedCourseId)
      : groups;
  }, [groups, selectedCourseId]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesProgram =
        programFilter === "all" ? true : user.program === programFilter;
      const query = userSearch.toLowerCase();
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return matchesProgram && matchesSearch;
    });
  }, [programFilter, userSearch, users]);

  const assignableGroups = courseGroups.length > 0 ? courseGroups : groups;

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

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
  };

  const handleSaveSession = () => {
    if (!editFormState || !editFormState.courseId) return;

    const updatedDuration = calculateDuration(
      editFormState.time,
      editFormState.endTime
    );

    // Update bestehende Session
    if (editingSession) {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === editingSession.id
            ? {
                ...session,
                courseId: editFormState.courseId!,
                title: editFormState.title,
                date: editFormState.date,
                time: editFormState.time,
                endTime: editFormState.endTime,
                duration: updatedDuration,
                location: editFormState.location,
                locationType: editFormState.locationType,
                attendance: editFormState.attendance,
              }
            : session
        )
      );
    } else {
      // Neue Session anlegen
      const course = mockCourses.find((c) => c.id === editFormState.courseId);

      if (course) {
        const newSession: Session = {
          id: `s-${Date.now()}`,
          courseId: editFormState.courseId,
          type: "lecture",
          title: editFormState.title,
          date: editFormState.date,
          time: editFormState.time,
          endTime: editFormState.endTime,
          duration: updatedDuration,
          location: editFormState.location,
          locationType: editFormState.locationType,
          attendance: editFormState.attendance,
          objectives: [],
          materials: [],
        };

        setSessions((prev) => [...prev, newSession]);
      }
    }

    setEditingSession(null);
    setEditFormState(null);
  };

  const handleCreateCoaching = (data: {
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
    // Convert participant IDs to names
    const participantNames = data.participants
      .map((id) => {
        const user = users.find((u) => u.id === id);
        return user?.name;
      })
      .filter((name): name is string => !!name);

    const newSlot: CoachingSlot = {
      id: `cs-${Date.now()}`,
      courseId: data.courseId,
      date: data.date,
      time: data.time,
      endTime: data.endTime,
      duration: calculateDuration(data.time, data.endTime),
      maxParticipants: data.maxParticipants,
      participants: participantNames,
      description: data.description,
      createdAt: new Date(),
    };

    setCoachingSlots((prev) => [...prev, newSlot]);
  };

  const handleOpenEditCoaching = (slot: CoachingSlot) => {
    setEditingCoachingSlot(slot);
    setIsCreateCoachingOpen(true);
  };

  const handleSaveCoaching = (data: {
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
    if (editingCoachingSlot) {
      // Update existing coaching slot
      const participantNames = data.participants
        .map((id) => {
          const user = users.find((u) => u.id === id);
          return user?.name;
        })
        .filter((name): name is string => !!name);

      setCoachingSlots((prev) =>
        prev.map((slot) =>
          slot.id === editingCoachingSlot.id
            ? {
                ...slot,
                courseId: data.courseId,
                date: data.date,
                time: data.time,
                endTime: data.endTime,
                duration: calculateDuration(data.time, data.endTime),
                maxParticipants: data.maxParticipants,
                participants: participantNames,
                description: data.description,
              }
            : slot
        )
      );
      setEditingCoachingSlot(null);
    } else {
      // Create new coaching slot
      handleCreateCoaching(data);
    }
    setIsCreateCoachingOpen(false);
  };

  const handleDeleteCoaching = (slotId: string) => {
    setCoachingSlots((prev) => prev.filter((slot) => slot.id !== slotId));
    setCoachingSlotToDelete(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
    setGroupToDelete(null);
  };

  const handleAssignUserToGroup = (groupId: string, userId: string) => {
    if (!groupId || !userId) return;

    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;

        const isAlreadyMember = group.members.includes(user.name);
        const isFull =
          group.maxMembers && group.members.length >= group.maxMembers;
        if (isAlreadyMember || isFull) {
          return group;
        }

        return {
          ...group,
          members: [...group.members, user.name],
        };
      })
    );
  };

  const handleRemoveUserFromGroup = (groupId: string, member: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: group.members.filter((existing) => existing !== member),
            }
          : group
      )
    );
  };

  const handleCreateGroup = (data: CreateGroupFormData) => {
    const courseId = data.courseId || selectedCourseId;
    if (!courseId || !data.name.trim()) return;

    const newGroup: Group = {
      id: `g-${Date.now()}`,
      courseId,
      name: data.name,
      description: data.description || undefined,
      maxMembers: data.maxMembers || undefined,
      members: [],
      createdAt: new Date(),
    };

    setGroups((prev) => [...prev, newGroup]);
  };

  const handleCreateOrEditStudent = (data: CreateStudentFormData) => {
    if (editingStudent) {
      // Update existing user
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingStudent.id
            ? {
                ...user,
                name: data.name,
                email: data.email,
                program: data.program,
                role: "student",
                initials: data.initials,
              }
            : user
        )
      );
      setEditingStudent(null);
    } else {
      // Create new user
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: data.name,
        email: data.email,
        program: data.program,
        role: "student",
        initials: data.initials,
      };
      setUsers((prev) => [...prev, newUser]);
    }
  };

  const handleOpenEditStudent = (user: User) => {
    setEditingStudent(user);
    setIsCreateStudentOpen(true);
  };

  const handleDeleteStudent = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const dashboardTabs = [
    {
      value: "lvs",
      label: "Lehrveranstaltungen",
      badge: courseSessions.length > 0 ? courseSessions.length : undefined,
    },
    {
      value: "coachings",
      label: "Coachings",
      badge:
        courseCoachingSlots.length > 0 ? courseCoachingSlots.length : undefined,
    },
    {
      value: "groups",
      label: "Gruppen",
      badge: courseGroups.length > 0 ? courseGroups.length : undefined,
    },
    {
      value: "users",
      label: "Studenten",
      badge: users.length > 0 ? users.length : undefined,
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
                {activeDashboardTab !== "users" && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <CourseSelector
                      courses={mockCourses}
                      selectedCourseId={selectedCourseId}
                      onCourseChange={setSelectedCourseId}
                    />
                    {["lvs", "coachings"].includes(activeDashboardTab) &&
                      selectedCourse && (
                        <div className="flex flex-wrap gap-2 text-xs text-zinc-500 sm:items-end">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-50 border border-zinc-200">
                            <CalendarClock className="w-3 h-3 text-zinc-400" />
                            {courseSessions.length} Lehrveranstaltungen
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-50 border border-zinc-200">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            {courseCoachingSlots.length} Coaching-Slots
                          </span>
                        </div>
                      )}
                  </div>
                )}

                {activeDashboardTab === "lvs" && (
                  <SessionsTab
                    sessions={courseSessions}
                    courses={mockCourses}
                    selectedCourseId={selectedCourseId}
                    onCourseChange={setSelectedCourseId}
                    onEdit={handleOpenEditSession}
                    onDelete={setSessionToDelete}
                    onCreate={handleOpenCreateSession}
                  />
                )}

                {activeDashboardTab === "coachings" && (
                  <CoachingSlotsTab
                    slots={courseCoachingSlots}
                    courses={mockCourses}
                    selectedCourseId={selectedCourseId}
                    onEdit={handleOpenEditCoaching}
                    onDelete={setCoachingSlotToDelete}
                    onCreate={() => {
                      setEditingCoachingSlot(null);
                      setIsCreateCoachingOpen(true);
                    }}
                  />
                )}

                {activeDashboardTab === "groups" && (
                  <GroupsTab
                    groups={courseGroups}
                    courses={mockCourses}
                    users={users}
                    onDelete={handleDeleteGroup}
                    onAssignUser={handleAssignUserToGroup}
                    onRemoveUser={handleRemoveUserFromGroup}
                    onCreate={() => setIsCreateGroupOpen(true)}
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
