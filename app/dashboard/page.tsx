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
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import { CreateCoachingSlotDialog } from "@/components/coaching/CreateCoachingSlotDialog";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Calendar,
  Edit3,
  Plus,
  CalendarClock,
  Trash2,
  MapPin,
  Video,
  ChevronDown,
  ChevronUp,
  History,
  Users,
} from "lucide-react";
import { format, isToday, isPast } from "date-fns";
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

function calculateDuration(startTime: string, endTime: string): string {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const start = startHours * 60 + startMinutes;
  const end = endHours * 60 + endMinutes;
  const diff = end - start;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

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
  const [showPastSessions, setShowPastSessions] = useState(false);

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
    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [sessions, selectedCourseId]);

  const courseCoachingSlots = useMemo(() => {
    const filtered = selectedCourseId
      ? coachingSlots.filter((slot) => slot.courseId === selectedCourseId)
      : coachingSlots;
    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
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
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-zinc-600 mb-1">
                        Fach auswählen
                      </label>
                      <Select
                        options={[
                          { value: "", label: "Alle LVs" },
                          ...mockCourses.map((course) => ({
                            value: course.id,
                            label: course.title,
                          })),
                        ]}
                        value={selectedCourseId || ""}
                        onChange={(value) => setSelectedCourseId(value || null)}
                      />
                    </div>
                    {["lvs", "coachings"].includes(activeDashboardTab) &&
                      selectedCourse && (
                        <div className="flex flex-wrap gap-2 text-xs text-zinc-500 sm:items-end">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-50 border border-zinc-200">
                            <CalendarClock className="w-3 h-3 text-zinc-400" />
                            {courseSessions.length} LV-Termine
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
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 flex-1">
                        LV-Termine verwalten
                      </h2>
                      <Button
                        size="sm"
                        className="h-8 px-2 sm:px-3 text-xs shrink-0 w-full sm:w-auto"
                        icon={Plus}
                        iconPosition="left"
                        onClick={handleOpenCreateSession}
                      >
                        Neuer Termin
                      </Button>
                    </div>

                    {courseSessions.length === 0 ? (
                      <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-center text-xs text-zinc-500 bg-zinc-50/60">
                        Für dieses Fach sind aktuell keine LV-Termine
                        hinterlegt.
                      </div>
                    ) : (
                      (() => {
                        const now = new Date();

                        // Sort all sessions by date and time (like before)
                        const sortedSessions = [...courseSessions].sort(
                          (a, b) => {
                            // First sort by date
                            const dateA = new Date(a.date);
                            const dateB = new Date(b.date);
                            const dateDiff = dateA.getTime() - dateB.getTime();
                            if (dateDiff !== 0) return dateDiff;

                            // Then sort by time
                            const [aHours, aMinutes] = a.time
                              .split(":")
                              .map(Number);
                            const [bHours, bMinutes] = b.time
                              .split(":")
                              .map(Number);
                            return (
                              aHours * 60 + aMinutes - (bHours * 60 + bMinutes)
                            );
                          }
                        );

                        // Separate past and future sessions for filtering
                        const pastSessions = sortedSessions.filter(
                          (session) => {
                            const sessionEndDateTime = new Date(session.date);
                            if (session.endTime) {
                              const [hours, minutes] = session.endTime
                                .split(":")
                                .map(Number);
                              sessionEndDateTime.setHours(hours, minutes, 0, 0);
                            } else {
                              const [hours, minutes] = session.time
                                .split(":")
                                .map(Number);
                              sessionEndDateTime.setHours(hours, minutes, 0, 0);
                            }
                            return sessionEndDateTime < now;
                          }
                        );

                        // Filter sessions to show
                        const sessionsToShow = showPastSessions
                          ? sortedSessions
                          : sortedSessions.filter((session) => {
                              const sessionEndDateTime = new Date(session.date);
                              if (session.endTime) {
                                const [hours, minutes] = session.endTime
                                  .split(":")
                                  .map(Number);
                                sessionEndDateTime.setHours(
                                  hours,
                                  minutes,
                                  0,
                                  0
                                );
                              } else {
                                const [hours, minutes] = session.time
                                  .split(":")
                                  .map(Number);
                                sessionEndDateTime.setHours(
                                  hours,
                                  minutes,
                                  0,
                                  0
                                );
                              }
                              return sessionEndDateTime >= now;
                            });

                        const getDateLabel = (date: Date) => {
                          return format(date, "EEE d.M.yyyy", { locale: de });
                        };

                        return (
                          <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block rounded-lg border border-zinc-200 bg-white overflow-hidden">
                              {/* Table Header */}
                              <div
                                className={`grid gap-3 px-4 py-2.5 text-xs font-semibold text-zinc-600 bg-zinc-50 border-b border-zinc-200 ${
                                  selectedCourseId
                                    ? "grid-cols-[140px,100px,1fr,180px,auto]"
                                    : "grid-cols-[140px,100px,180px,1fr,180px,auto]"
                                }`}
                              >
                                <span>Datum</span>
                                <span>Zeit</span>
                                {!selectedCourseId && <span>Fach</span>}
                                <span>Titel</span>
                                <span>Ort</span>
                                <span className="text-right">Aktionen</span>
                              </div>

                              {/* Table Body */}
                              <div className="divide-y divide-zinc-100">
                                {/* Past Sessions Toggle - First Row */}
                                {pastSessions.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPastSessions(!showPastSessions)
                                    }
                                    className="w-full px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors text-xs font-medium text-zinc-600"
                                  >
                                    <History className="w-4 h-4 text-zinc-400" />
                                    <span>
                                      Vergangene Termine ({pastSessions.length})
                                    </span>
                                    {showPastSessions ? (
                                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                                    )}
                                  </button>
                                )}

                                {sessionsToShow.map((session) => {
                                  const now = new Date();
                                  const sessionEndDateTime = new Date(
                                    session.date
                                  );
                                  if (session.endTime) {
                                    const [hours, minutes] = session.endTime
                                      .split(":")
                                      .map(Number);
                                    sessionEndDateTime.setHours(
                                      hours,
                                      minutes,
                                      0,
                                      0
                                    );
                                  } else {
                                    const [hours, minutes] = session.time
                                      .split(":")
                                      .map(Number);
                                    sessionEndDateTime.setHours(
                                      hours,
                                      minutes,
                                      0,
                                      0
                                    );
                                  }
                                  const isPastSession =
                                    sessionEndDateTime < now;

                                  const date = new Date(session.date);
                                  const isPastDate =
                                    isPast(date) && !isToday(date);
                                  const isTodayDate = isToday(date);

                                  const course = mockCourses.find(
                                    (c) => c.id === session.courseId
                                  );

                                  return (
                                    <div
                                      key={session.id}
                                      className={`group grid gap-3 px-4 py-2.5 items-center hover:bg-zinc-50 transition-colors ${
                                        selectedCourseId
                                          ? "grid-cols-[140px,100px,1fr,180px,auto]"
                                          : "grid-cols-[140px,100px,180px,1fr,180px,auto]"
                                      } ${isPastSession ? "opacity-60" : ""}`}
                                    >
                                      {/* Datum */}
                                      <div className="text-xs">
                                        <div className="flex items-center gap-1.5">
                                          <Calendar
                                            className={`w-3.5 h-3.5 shrink-0 ${
                                              isPastDate
                                                ? "text-zinc-400"
                                                : isTodayDate
                                                ? "text-blue-600"
                                                : "text-zinc-500"
                                            }`}
                                          />
                                          <span
                                            className={
                                              isPastDate
                                                ? "text-zinc-400"
                                                : "text-zinc-900"
                                            }
                                          >
                                            {getDateLabel(date)}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Zeit */}
                                      <div className="text-xs font-medium text-zinc-900 tabular-nums">
                                        {session.time}
                                        {session.endTime && (
                                          <span className="text-zinc-500">
                                            {" "}
                                            – {session.endTime}
                                          </span>
                                        )}
                                      </div>

                                      {/* Fach (nur wenn alle LVs ausgewählt) */}
                                      {!selectedCourseId && (
                                        <div className="text-xs font-medium text-zinc-700 truncate">
                                          {course?.title || "Unbekannt"}
                                        </div>
                                      )}

                                      {/* Titel */}
                                      <div className="text-xs font-medium text-zinc-900 truncate">
                                        {session.title}
                                      </div>

                                      {/* Ort */}
                                      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                                        {session.locationType === "online" ? (
                                          <>
                                            <Video className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                            <span className="truncate">
                                              {session.location || "Online"}
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                            <span className="truncate">
                                              {session.location || "Kein Ort"}
                                            </span>
                                          </>
                                        )}
                                      </div>

                                      {/* Aktionen */}
                                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="h-7 w-7 p-0"
                                          onClick={() =>
                                            handleOpenEditSession(session)
                                          }
                                          title="Bearbeiten"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="h-7 w-7 p-0"
                                          onClick={() =>
                                            setSessionToDelete(session)
                                          }
                                          title="Löschen"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Mobile List View */}
                            <div className="md:hidden space-y-2">
                              {/* Past Sessions Toggle - First Item */}
                              {pastSessions.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowPastSessions(!showPastSessions)
                                  }
                                  className="w-full px-3 py-2 flex items-center justify-center gap-2 text-xs font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors"
                                >
                                  <History className="w-4 h-4 text-zinc-400" />
                                  <span>
                                    Vergangene Termine ({pastSessions.length})
                                  </span>
                                  {showPastSessions ? (
                                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                                  )}
                                </button>
                              )}

                              {/* Sessions */}
                              {sessionsToShow.map((session) => {
                                const now = new Date();
                                const sessionEndDateTime = new Date(
                                  session.date
                                );
                                if (session.endTime) {
                                  const [hours, minutes] = session.endTime
                                    .split(":")
                                    .map(Number);
                                  sessionEndDateTime.setHours(
                                    hours,
                                    minutes,
                                    0,
                                    0
                                  );
                                } else {
                                  const [hours, minutes] = session.time
                                    .split(":")
                                    .map(Number);
                                  sessionEndDateTime.setHours(
                                    hours,
                                    minutes,
                                    0,
                                    0
                                  );
                                }
                                const isPastSession = sessionEndDateTime < now;

                                const date = new Date(session.date);
                                const isPastDate =
                                  isPast(date) && !isToday(date);
                                const isTodayDate = isToday(date);

                                const course = mockCourses.find(
                                  (c) => c.id === session.courseId
                                );

                                return (
                                  <div
                                    key={session.id}
                                    className={`group bg-white border border-zinc-200 rounded-md p-3 ${
                                      isPastSession ? "opacity-60" : ""
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <Calendar
                                            className={`w-3.5 h-3.5 shrink-0 ${
                                              isPastDate
                                                ? "text-zinc-400"
                                                : isTodayDate
                                                ? "text-blue-600"
                                                : "text-zinc-500"
                                            }`}
                                          />
                                          <span
                                            className={`text-xs font-medium ${
                                              isPastDate
                                                ? "text-zinc-400"
                                                : "text-zinc-900"
                                            }`}
                                          >
                                            {getDateLabel(date)}
                                          </span>
                                          <span className="text-xs font-semibold text-zinc-900 tabular-nums">
                                            {session.time}
                                            {session.endTime && (
                                              <span className="text-zinc-500">
                                                {" "}
                                                – {session.endTime}
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                        {!selectedCourseId && course && (
                                          <div className="text-[10px] font-medium text-zinc-600 mb-0.5">
                                            {course.title}
                                          </div>
                                        )}
                                        <h4 className="text-xs font-semibold text-zinc-900 leading-tight mb-1">
                                          {session.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                                          {session.locationType === "online" ? (
                                            <>
                                              <Video className="w-3 h-3 text-zinc-400 shrink-0" />
                                              <span className="truncate">
                                                {session.location || "Online"}
                                              </span>
                                            </>
                                          ) : (
                                            <>
                                              <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                                              <span className="truncate">
                                                {session.location || "Kein Ort"}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="h-7 w-7 p-0"
                                          onClick={() =>
                                            handleOpenEditSession(session)
                                          }
                                          title="Bearbeiten"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="h-7 w-7 p-0"
                                          onClick={() =>
                                            setSessionToDelete(session)
                                          }
                                          title="Löschen"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()
                    )}
                  </div>
                )}

                {activeDashboardTab === "coachings" && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 flex-1">
                        Coaching-Slots
                      </h2>
                      <Button
                        size="sm"
                        className="h-8 px-2 sm:px-3 text-xs shrink-0 w-full sm:w-auto"
                        icon={Plus}
                        iconPosition="left"
                        onClick={() => {
                          setEditingCoachingSlot(null);
                          setIsCreateCoachingOpen(true);
                        }}
                      >
                        Neuer Slot
                      </Button>
                    </div>

                    {courseCoachingSlots.length === 0 ? (
                      <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-center text-xs text-zinc-500 bg-zinc-50/60">
                        Noch keine Coaching-Slots für dieses Fach angelegt.
                      </div>
                    ) : (
                      (() => {
                        const now = new Date();

                        // Sort coaching slots by date and time
                        const sortedSlots = [...courseCoachingSlots].sort(
                          (a, b) => {
                            // First sort by date
                            const dateA = new Date(a.date);
                            const dateB = new Date(b.date);
                            const dateDiff = dateA.getTime() - dateB.getTime();
                            if (dateDiff !== 0) return dateDiff;

                            // Then sort by time
                            const [aHours, aMinutes] = a.time
                              .split(":")
                              .map(Number);
                            const [bHours, bMinutes] = b.time
                              .split(":")
                              .map(Number);
                            return (
                              aHours * 60 + aMinutes - (bHours * 60 + bMinutes)
                            );
                          }
                        );

                        // Separate past and future slots for filtering
                        const pastSlots = sortedSlots.filter((slot) => {
                          const slotEndDateTime = new Date(slot.date);
                          const [hours, minutes] = slot.endTime
                            .split(":")
                            .map(Number);
                          slotEndDateTime.setHours(hours, minutes, 0, 0);
                          return slotEndDateTime < now;
                        });

                        // Filter slots to show
                        const slotsToShow = showPastSessions
                          ? sortedSlots
                          : sortedSlots.filter((slot) => {
                              const slotEndDateTime = new Date(slot.date);
                              const [hours, minutes] = slot.endTime
                                .split(":")
                                .map(Number);
                              slotEndDateTime.setHours(hours, minutes, 0, 0);
                              return slotEndDateTime >= now;
                            });

                        const getDateLabel = (date: Date) => {
                          return format(date, "EEE d.M.yyyy", { locale: de });
                        };

                        return (
                          <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block rounded-lg border border-zinc-200 bg-white overflow-hidden">
                              {/* Table Header */}
                              <div
                                className={`grid gap-3 px-4 py-2.5 text-xs font-semibold text-zinc-600 bg-zinc-50 border-b border-zinc-200 ${
                                  selectedCourseId
                                    ? "grid-cols-[140px,100px,200px,1fr,auto]"
                                    : "grid-cols-[140px,100px,180px,200px,1fr,auto]"
                                }`}
                              >
                                <span>Datum</span>
                                <span>Zeit</span>
                                {!selectedCourseId && <span>Fach</span>}
                                <span>Teilnehmer</span>
                                <span>Beschreibung</span>
                                <span className="text-right">Aktionen</span>
                              </div>

                              {/* Table Body */}
                              <div className="divide-y divide-zinc-100">
                                {/* Past Slots Toggle - First Row */}
                                {pastSlots.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPastSessions(!showPastSessions)
                                    }
                                    className="w-full px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors text-xs font-medium text-zinc-600"
                                  >
                                    <History className="w-4 h-4 text-zinc-400" />
                                    <span>
                                      Vergangene Slots ({pastSlots.length})
                                    </span>
                                    {showPastSessions ? (
                                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                                    )}
                                  </button>
                                )}

                                {slotsToShow.map((slot) => {
                                  const now = new Date();
                                  const slotEndDateTime = new Date(slot.date);
                                  const [hours, minutes] = slot.endTime
                                    .split(":")
                                    .map(Number);
                                  slotEndDateTime.setHours(
                                    hours,
                                    minutes,
                                    0,
                                    0
                                  );
                                  const isPastSlot = slotEndDateTime < now;

                                  const date = new Date(slot.date);
                                  const isPastDate =
                                    isPast(date) && !isToday(date);
                                  const isTodayDate = isToday(date);

                                  const course = mockCourses.find(
                                    (c) => c.id === slot.courseId
                                  );

                                  return (
                                    <div
                                      key={slot.id}
                                      className={`group grid gap-3 px-4 py-2.5 items-center hover:bg-zinc-50 transition-colors ${
                                        selectedCourseId
                                          ? "grid-cols-[140px,100px,200px,1fr,auto]"
                                          : "grid-cols-[140px,100px,180px,200px,1fr,auto]"
                                      } ${isPastSlot ? "opacity-60" : ""}`}
                                    >
                                      {/* Datum */}
                                      <div className="text-xs">
                                        <div className="flex items-center gap-1.5">
                                          <Calendar
                                            className={`w-3.5 h-3.5 shrink-0 ${
                                              isPastDate
                                                ? "text-zinc-400"
                                                : isTodayDate
                                                ? "text-blue-600"
                                                : "text-zinc-500"
                                            }`}
                                          />
                                          <span
                                            className={
                                              isPastDate
                                                ? "text-zinc-400"
                                                : "text-zinc-900"
                                            }
                                          >
                                            {getDateLabel(date)}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Zeit */}
                                      <div className="text-xs font-medium text-zinc-900 tabular-nums">
                                        {slot.time}
                                        {slot.endTime && (
                                          <span className="text-zinc-500">
                                            {" "}
                                            – {slot.endTime}
                                          </span>
                                        )}
                                      </div>

                                      {/* Fach (nur wenn alle Coachings ausgewählt) */}
                                      {!selectedCourseId && (
                                        <div className="text-xs font-medium text-zinc-700 truncate">
                                          {course?.title || "Unbekannt"}
                                        </div>
                                      )}

                                      {/* Teilnehmer */}
                                      <div className="text-xs text-zinc-600">
                                        {slot.participants.length > 0 ? (
                                          <div className="flex flex-wrap gap-1">
                                            {slot.participants.map(
                                              (participant) => (
                                                <span
                                                  key={participant}
                                                  className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700"
                                                >
                                                  {participant}
                                                </span>
                                              )
                                            )}
                                            <span className="text-[11px] text-zinc-500 ml-1">
                                              ({slot.participants.length}/
                                              {slot.maxParticipants})
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                            <span className="text-zinc-400">
                                              0/{slot.maxParticipants}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Beschreibung */}
                                      <div className="text-xs text-zinc-600 truncate">
                                        {slot.description || "—"}
                                      </div>

                                      {/* Aktionen */}
                                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="h-7 w-7 p-0"
                                          onClick={() =>
                                            handleOpenEditCoaching(slot)
                                          }
                                          title="Bearbeiten"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="h-7 w-7 p-0"
                                          onClick={() =>
                                            setCoachingSlotToDelete(slot)
                                          }
                                          title="Löschen"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Mobile List View */}
                            <div className="md:hidden space-y-2">
                              {/* Past Slots Toggle - First Item */}
                              {pastSlots.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowPastSessions(!showPastSessions)
                                  }
                                  className="w-full px-3 py-2 flex items-center justify-center gap-2 text-xs font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors"
                                >
                                  <History className="w-4 h-4 text-zinc-400" />
                                  <span>
                                    Vergangene Slots ({pastSlots.length})
                                  </span>
                                  {showPastSessions ? (
                                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                                  )}
                                </button>
                              )}

                              {/* Slots */}
                              {slotsToShow.map((slot) => {
                                const now = new Date();
                                const slotEndDateTime = new Date(slot.date);
                                const [hours, minutes] = slot.endTime
                                  .split(":")
                                  .map(Number);
                                slotEndDateTime.setHours(hours, minutes, 0, 0);
                                const isPastSlot = slotEndDateTime < now;

                                const date = new Date(slot.date);
                                const isPastDate =
                                  isPast(date) && !isToday(date);
                                const isTodayDate = isToday(date);

                                const course = mockCourses.find(
                                  (c) => c.id === slot.courseId
                                );

                                return (
                                  <div
                                    key={slot.id}
                                    className={`group bg-white border border-zinc-200 rounded-md p-3 ${
                                      isPastSlot ? "opacity-60" : ""
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <Calendar
                                            className={`w-3.5 h-3.5 shrink-0 ${
                                              isPastDate
                                                ? "text-zinc-400"
                                                : isTodayDate
                                                ? "text-blue-600"
                                                : "text-zinc-500"
                                            }`}
                                          />
                                          <span
                                            className={`text-xs font-medium ${
                                              isPastDate
                                                ? "text-zinc-400"
                                                : "text-zinc-900"
                                            }`}
                                          >
                                            {getDateLabel(date)}
                                          </span>
                                          <span className="text-xs font-semibold text-zinc-900 tabular-nums">
                                            {slot.time}
                                            {slot.endTime && (
                                              <span className="text-zinc-500">
                                                {" "}
                                                – {slot.endTime}
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                        {!selectedCourseId && course && (
                                          <div className="text-[10px] font-medium text-zinc-600 mb-0.5">
                                            {course.title}
                                          </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 mb-1">
                                          <Users className="w-3 h-3 text-zinc-400 shrink-0" />
                                          <span>
                                            {slot.participants.length}/
                                            {slot.maxParticipants} Teilnehmer
                                          </span>
                                        </div>
                                        {slot.description && (
                                          <p className="text-[10px] text-zinc-600 leading-relaxed">
                                            {slot.description}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="h-7 w-7 p-0"
                                          onClick={() =>
                                            handleOpenEditCoaching(slot)
                                          }
                                          title="Bearbeiten"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="h-7 w-7 p-0"
                                          onClick={() =>
                                            setCoachingSlotToDelete(slot)
                                          }
                                          title="Löschen"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()
                    )}
                  </div>
                )}

                {activeDashboardTab === "groups" && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 flex-1">
                          Gruppenübersicht
                        </h2>
                        <Button
                          size="sm"
                          className="h-8 px-2 sm:px-3 text-xs shrink-0 w-full sm:w-auto"
                          icon={Plus}
                          iconPosition="left"
                          onClick={() => setIsCreateGroupOpen(true)}
                        >
                          Neue Gruppe
                        </Button>
                      </div>

                      {courseGroups.length === 0 ? (
                        <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-center text-xs text-zinc-500 bg-zinc-50/60">
                          Für dieses Fach sind noch keine Gruppen angelegt.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {courseGroups.map((group) => {
                            const courseTitle =
                              mockCourses.find((c) => c.id === group.courseId)
                                ?.title ?? "Kurs";
                            const isFull =
                              group.maxMembers &&
                              group.members.length >= group.maxMembers;

                            return (
                              <div
                                key={group.id}
                                className="group rounded-lg border border-zinc-100 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-zinc-900">
                                      {group.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                      {courseTitle}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-xs text-zinc-500">
                                      {group.members.length}
                                      {group.maxMembers
                                        ? ` / ${group.maxMembers}`
                                        : ""}{" "}
                                      Mitglieder
                                      {isFull && (
                                        <span className="ml-2 text-amber-600 font-medium">
                                          Gruppe voll
                                        </span>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                      onClick={() => setGroupToDelete(group)}
                                      title="Löschen"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  {group.members.length === 0 && (
                                    <span className="text-xs text-zinc-500">
                                      Noch keine Mitglieder
                                    </span>
                                  )}
                                  {group.members.map((member) => (
                                    <span
                                      key={member}
                                      className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700"
                                    >
                                      {member}
                                      <button
                                        type="button"
                                        className="text-zinc-400 hover:text-zinc-700 transition-colors"
                                        onClick={() =>
                                          handleRemoveUserFromGroup(
                                            group.id,
                                            member
                                          )
                                        }
                                      >
                                        <span className="sr-only">
                                          {member} entfernen
                                        </span>
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                  {!isFull && (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          size="xs"
                                          variant="secondary"
                                          className="h-6 px-1.5 text-xs shrink-0"
                                          icon={Plus}
                                          iconPosition="left"
                                        >
                                          Student hinzufügen
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-64 p-1"
                                        align="start"
                                      >
                                        <div className="max-h-[200px] overflow-auto space-y-0.5">
                                          {users
                                            .filter(
                                              (user) =>
                                                !group.members.includes(
                                                  user.name
                                                )
                                            )
                                            .map((user) => (
                                              <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => {
                                                  handleAssignUserToGroup(
                                                    group.id,
                                                    user.id
                                                  );
                                                }}
                                                className="w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-zinc-100 transition-colors text-zinc-700"
                                              >
                                                <div className="font-medium">
                                                  {user.name}
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                  {user.program}
                                                </div>
                                              </button>
                                            ))}
                                          {users.filter(
                                            (user) =>
                                              !group.members.includes(user.name)
                                          ).length === 0 && (
                                            <div className="px-3 py-2 text-xs text-zinc-500 text-center">
                                              Keine verfügbaren User
                                            </div>
                                          )}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeDashboardTab === "users" && (
                  <div className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-[minmax(0,280px),minmax(0,1fr)]">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">
                          Programm filtern
                        </label>
                        <Select
                          options={[
                            { value: "all", label: "Alle Programme" },
                            { value: "DTI", label: "DTI" },
                            { value: "DI", label: "DI" },
                          ]}
                          value={programFilter}
                          onChange={(value) =>
                            setProgramFilter(value as Program | "all")
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">
                          Student suchen
                        </label>
                        <Input
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Name oder E-Mail"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {filteredUsers.length === 0 ? (
                      <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-center text-xs text-zinc-500 bg-zinc-50/60">
                        Keine User gefunden.
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 flex-1">
                            Studenten
                          </h2>
                          <Button
                            size="sm"
                            className="h-8 px-2 sm:px-3 text-xs shrink-0 w-full sm:w-auto"
                            icon={Plus}
                            iconPosition="left"
                            onClick={() => {
                              setEditingStudent(null);
                              setIsCreateStudentOpen(true);
                            }}
                          >
                            Neuer Student
                          </Button>
                        </div>
                        <div className="hidden md:block rounded-lg border border-zinc-100 bg-white overflow-hidden">
                          <div className="grid grid-cols-[1.4fr,0.9fr,0.8fr,auto] text-xs font-medium text-zinc-500 border-b border-zinc-100 bg-zinc-50/60 px-3 py-2">
                            <span>User</span>
                            <span>Programm</span>
                            <span>Rolle</span>
                            <span className="text-right">Aktionen</span>
                          </div>
                          <div className="divide-y divide-zinc-100">
                            {filteredUsers.map((user) => {
                              return (
                                <div
                                  key={user.id}
                                  className="group grid grid-cols-[1.4fr,0.9fr,0.8fr,auto] items-center gap-2 px-3 py-2.5 text-xs hover:bg-zinc-50 transition-colors"
                                >
                                  <div>
                                    <p className="font-medium text-zinc-900">
                                      {user.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                      {user.email}
                                    </p>
                                  </div>
                                  <div className="text-xs text-zinc-600">
                                    {user.program}
                                  </div>
                                  <div className="text-xs text-zinc-600 capitalize">
                                    {user.role ?? "student"}
                                  </div>
                                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-7 w-7 p-0"
                                      onClick={() =>
                                        handleOpenEditStudent(user)
                                      }
                                      title="Bearbeiten"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 w-7 p-0"
                                      onClick={() => setStudentToDelete(user)}
                                      title="Löschen"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-2 md:hidden">
                          {filteredUsers.map((user) => {
                            return (
                              <div
                                key={user.id}
                                className="border border-zinc-100 rounded-lg p-3 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] text-xs"
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-zinc-900">
                                      {user.name}
                                    </div>
                                    <div className="text-zinc-500">
                                      {user.email}
                                    </div>
                                    <div className="mt-1 text-zinc-600">
                                      Programm: {user.program}
                                    </div>
                                    <div className="text-zinc-600">
                                      Rolle: {user.role ?? "student"}
                                    </div>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-7 w-7 p-0"
                                      onClick={() =>
                                        handleOpenEditStudent(user)
                                      }
                                      title="Bearbeiten"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 w-7 p-0"
                                      onClick={() => setStudentToDelete(user)}
                                      title="Löschen"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
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
