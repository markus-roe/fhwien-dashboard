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
  type LocationType,
  type Group,
  type User,
  type Program,
  currentUser,
} from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input, Textarea } from "@/components/ui/Input";
import { DatePickerCalendar } from "@/components/ui/DatePickerCalendar";
import { TimeInput } from "@/components/ui/TimeInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { CoachingSlotCard } from "@/components/coaching/CoachingSlotCard";
import { CreateCoachingSlotDialog } from "@/components/coaching/CreateCoachingSlotDialog";
import { Sidebar } from "@/components/layout/Sidebar";
import { Calendar, Edit3, Plus, CalendarClock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { redirect } from "next/navigation";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";

type AttendanceType = "mandatory" | "optional";

type EditSessionFormState = {
  title: string;
  date: Date;
  time: string;
  endTime: string;
  location: string;
  locationType: LocationType;
  attendance: AttendanceType;
  notes: string;
};

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

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    mockCourses[0]?.id ?? ""
  );
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

  const [isCreateCoachingOpen, setIsCreateCoachingOpen] = useState(false);

  const selectedCourse = useMemo(
    () => mockCourses.find((c) => c.id === selectedCourseId) || null,
    [selectedCourseId]
  );

  const courseSessions = useMemo(() => {
    return sessions
      .filter((session) => session.courseId === selectedCourseId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [sessions, selectedCourseId]);

  const courseCoachingSlots = useMemo(() => {
    return coachingSlots
      .filter((slot) => slot.courseId === selectedCourseId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [coachingSlots, selectedCourseId]);

  const courseGroups = useMemo(() => {
    return groups.filter((group) => group.courseId === selectedCourseId);
  }, [groups, selectedCourseId]);

  const totalGroupMembers = useMemo(() => {
    return courseGroups.reduce((acc, group) => acc + group.members.length, 0);
  }, [courseGroups]);

  const totalFreeSeats = useMemo(() => {
    return courseGroups.reduce((acc, group) => {
      if (!group.maxMembers) return acc;
      return acc + Math.max(group.maxMembers - group.members.length, 0);
    }, 0);
  }, [courseGroups]);

  const userGroupsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    groups.forEach((group) => {
      group.members.forEach((member) => {
        const user = mockUsers.find((u) => u.name === member);
        if (!user) return;
        map[user.id] = map[user.id]
          ? [...map[user.id], group.name]
          : [group.name];
      });
    });
    return map;
  }, [groups]);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesProgram =
        programFilter === "all" ? true : user.program === programFilter;
      const query = userSearch.toLowerCase();
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return matchesProgram && matchesSearch;
    });
  }, [programFilter, userSearch]);

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
    if (!mockUsers.some((user) => user.id === selectedUserId) && mockUsers[0]) {
      setSelectedUserId(mockUsers[0].id);
    }
  }, [selectedUserId]);

  const handleOpenEditSession = (session: Session) => {
    setEditingSession(session);
    setEditFormState({
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

    if (!selectedCourse) return;

    setEditingSession(null);
    setEditFormState({
      title: selectedCourse.title,
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
    if (!editFormState) return;

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
      const course = mockCourses.find((c) => c.id === selectedCourseId) ?? null;

      if (course) {
        const newSession: Session = {
          id: `s-${Date.now()}`,
          courseId: course.id,
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
    description?: string;
  }) => {
    const newSlot: CoachingSlot = {
      id: `cs-${Date.now()}`,
      courseId: data.courseId,
      date: data.date,
      time: data.time,
      endTime: data.endTime,
      duration: calculateDuration(data.time, data.endTime),
      maxParticipants: data.maxParticipants,
      participants: [],
      description: data.description,
      createdAt: new Date(),
    };

    setCoachingSlots((prev) => [...prev, newSlot]);
  };

  const handleDeleteCoaching = (slotId: string) => {
    setCoachingSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const handleAssignUserToGroup = () => {
    if (!selectedGroupId || !selectedUserId) return;

    const user = mockUsers.find((u) => u.id === selectedUserId);
    if (!user) return;

    setGroups((prev) =>
      prev.map((group) => {
        if (group.id !== selectedGroupId) return group;

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

  const dashboardTabOptions = [
    {
      value: "lvs",
      label: "Lehrveranstaltungen",
      badge: courseSessions.length,
    },
    {
      value: "coachings",
      label: "Coachings",
      badge: courseCoachingSlots.length,
    },
    {
      value: "groups",
      label: "Gruppen",
      badge: courseGroups.length || groups.length,
    },
    {
      value: "users",
      label: "Studenten",
      badge: mockUsers.length,
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-auto">
          <Sidebar
            showCalendar={true}
            showNextUpCard={false}
            emptyMessage="Keine anstehenden Termine."
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                Dashboard
              </h1>
            </div>
          </div>

          <Card>
            <CardContent className="p-3 sm:p-4 space-y-5">
              <SegmentedTabs
                value={activeDashboardTab}
                options={dashboardTabOptions}
                onChange={(value) =>
                  setActiveDashboardTab(
                    value as "lvs" | "coachings" | "groups" | "users"
                  )
                }
              />

              {["lvs", "coachings"].includes(activeDashboardTab) && (
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                  <div className="w-full md:max-w-xs">
                    <label className="block text-xs font-medium text-zinc-600 mb-1">
                      Fach auswählen
                    </label>
                    <Select
                      options={mockCourses.map((course) => ({
                        value: course.id,
                        label: course.title,
                      }))}
                      value={selectedCourseId}
                      onChange={(value) => setSelectedCourseId(value)}
                    />
                  </div>

                  {selectedCourse && (
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
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
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        LV-Termine verwalten
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Passen Sie Datum, Zeit und Ort Ihrer Einheiten an.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs"
                      icon={Plus}
                      iconPosition="left"
                      onClick={handleOpenCreateSession}
                    >
                      Neuer Termin
                    </Button>
                  </div>

                  {courseSessions.length === 0 ? (
                    <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-center text-xs text-zinc-500 bg-zinc-50/60">
                      Für dieses Fach sind aktuell keine LV-Termine hinterlegt.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="hidden md:block rounded-lg border border-zinc-100 bg-white overflow-hidden">
                        <div className="grid grid-cols-[1.4fr,1.1fr,1.1fr,auto] text-xs font-medium text-zinc-500 border-b border-zinc-100 bg-zinc-50/60 px-3 py-2">
                          <span>Termin</span>
                          <span>Zeit</span>
                          <span>Ort</span>
                          <span className="text-right">Aktion</span>
                        </div>
                        <div className="divide-y divide-zinc-100">
                          {courseSessions.map((session) => (
                            <div
                              key={session.id}
                              className="grid grid-cols-[1.4fr,1.1fr,1.1fr,auto] items-center gap-2 px-3 py-2.5 text-xs"
                            >
                              <div>
                                <p className="font-medium text-zinc-900 truncate">
                                  {session.title}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {format(session.date, "EEEE, d. MMMM yyyy", {
                                    locale: de,
                                  })}
                                </p>
                              </div>
                              <div className="text-xs text-zinc-600">
                                {session.time} – {session.endTime}
                              </div>
                              <div className="text-xs text-zinc-600 truncate">
                                {session.location}
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  icon={Edit3}
                                  iconPosition="left"
                                  onClick={() => handleOpenEditSession(session)}
                                >
                                  Bearbeiten
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setSessionToDelete(session)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 md:hidden">
                        {courseSessions.map((session) => (
                          <div
                            key={session.id}
                            className="border border-zinc-100 rounded-lg p-3 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold text-zinc-900">
                                  {session.title}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  {format(session.date, "d. MMM yyyy, EEEE", {
                                    locale: de,
                                  })}
                                </p>
                                <p className="text-xs text-zinc-600 mt-1">
                                  {session.time} – {session.endTime}
                                </p>
                                <p className="text-xs text-zinc-600">
                                  {session.location}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 px-2.5 text-xs"
                                  icon={Edit3}
                                  iconPosition="left"
                                  onClick={() => handleOpenEditSession(session)}
                                >
                                  Bearbeiten
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2.5 text-xs"
                                  onClick={() => setSessionToDelete(session)}
                                >
                                  Löschen
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeDashboardTab === "coachings" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        Coaching-Slots
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Bieten Sie zusätzliche Coaching-Termine für dieses Fach
                        an.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs"
                      icon={Plus}
                      iconPosition="left"
                      onClick={() => setIsCreateCoachingOpen(true)}
                    >
                      Neuer Slot
                    </Button>
                  </div>

                  {courseCoachingSlots.length === 0 ? (
                    <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-center text-xs text-zinc-500 bg-zinc-50/60">
                      Noch keine Coaching-Slots für dieses Fach angelegt.
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {courseCoachingSlots.map((slot) => (
                        <div key={slot.id}>
                          <CoachingSlotCard
                            slot={slot}
                            course={selectedCourse ?? undefined}
                            isProfessor={true}
                            onBook={() => {}}
                            onCancelBooking={() => {}}
                            onDelete={handleDeleteCoaching}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeDashboardTab === "groups" && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="w-full md:max-w-xs">
                      <label className="block text-xs font-medium text-zinc-600 mb-1">
                        Fach auswählen
                      </label>
                      <Select
                        options={mockCourses.map((course) => ({
                          value: course.id,
                          label: course.title,
                        }))}
                        value={selectedCourseId}
                        onChange={(value) => setSelectedCourseId(value)}
                      />
                    </div>
                    <div className="grid w-full md:w-auto grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                          Gruppen
                        </p>
                        <p className="text-base font-semibold text-zinc-900">
                          {courseGroups.length}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                          Mitglieder
                        </p>
                        <p className="text-base font-semibold text-zinc-900">
                          {totalGroupMembers}
                        </p>
                      </div>
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                          Freie Plätze
                        </p>
                        <p className="text-base font-semibold text-zinc-900">
                          {totalFreeSeats}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        Gruppenübersicht
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Verwalten Sie Mitglieder je Kursgruppe.
                      </p>
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
                              className="rounded-lg border border-zinc-100 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-zinc-900">
                                    {group.name}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {courseTitle}
                                  </p>
                                </div>
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
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
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
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">
                        User zu Gruppen zuweisen
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Wählen Sie eine Person und eine Gruppe des Kurses.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">
                          User auswählen
                        </label>
                        <Select
                          options={mockUsers.map((user) => ({
                            value: user.id,
                            label: `${user.name} – ${user.program}`,
                          }))}
                          value={selectedUserId}
                          onChange={(value) => setSelectedUserId(value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 mb-1">
                          Gruppe auswählen
                        </label>
                        <Select
                          options={
                            assignableGroups.length > 0
                              ? assignableGroups.map((group) => ({
                                  value: group.id,
                                  label: `${group.name} (${
                                    group.members.length
                                  }/${group.maxMembers ?? "∞"})`,
                                }))
                              : groups.map((group) => ({
                                  value: group.id,
                                  label: group.name,
                                }))
                          }
                          value={selectedGroupId}
                          onChange={(value) => setSelectedGroupId(value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        className="min-w-[180px]"
                        onClick={handleAssignUserToGroup}
                        disabled={
                          !selectedGroupId ||
                          !selectedUserId ||
                          assignableGroups.length === 0
                        }
                      >
                        Hinzufügen
                      </Button>
                    </div>
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
                        User suchen
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
                      <div className="hidden md:block rounded-lg border border-zinc-100 bg-white overflow-hidden">
                        <div className="grid grid-cols-[1.4fr,0.9fr,0.8fr,auto] text-xs font-medium text-zinc-500 border-b border-zinc-100 bg-zinc-50/60 px-3 py-2">
                          <span>User</span>
                          <span>Programm</span>
                          <span>Rolle</span>
                          <span>Gruppen</span>
                        </div>
                        <div className="divide-y divide-zinc-100">
                          {filteredUsers.map((user) => {
                            const groupsForUser = userGroupsMap[user.id] ?? [];
                            return (
                              <div
                                key={user.id}
                                className="grid grid-cols-[1.4fr,0.9fr,0.8fr,auto] items-center gap-2 px-3 py-2.5 text-xs"
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
                                <div className="flex flex-wrap gap-1">
                                  {groupsForUser.length > 0 ? (
                                    groupsForUser.map((groupName) => (
                                      <span
                                        key={groupName}
                                        className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700"
                                      >
                                        {groupName}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[11px] text-zinc-400">
                                      Keine Gruppe
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2 md:hidden">
                        {filteredUsers.map((user) => {
                          const groupsForUser = userGroupsMap[user.id] ?? [];
                          return (
                            <div
                              key={user.id}
                              className="border border-zinc-100 rounded-lg p-3 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] text-xs"
                            >
                              <div className="font-semibold text-zinc-900">
                                {user.name}
                              </div>
                              <div className="text-zinc-500">{user.email}</div>
                              <div className="mt-1 text-zinc-600">
                                Programm: {user.program}
                              </div>
                              <div className="text-zinc-600">
                                Rolle: {user.role ?? "student"}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {groupsForUser.length > 0 ? (
                                  groupsForUser.map((groupName) => (
                                    <span
                                      key={groupName}
                                      className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700"
                                    >
                                      {groupName}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-zinc-400">
                                    Keine Gruppe
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
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
        onOpenChange={setIsCreateCoachingOpen}
        courses={selectedCourse ? [selectedCourse] : mockCourses}
        onSubmit={handleCreateCoaching}
      />

      {/* Bestätigungsdialog für Löschen eines LV-Termins */}
      {sessionToDelete && (
        <Dialog open onOpenChange={() => setSessionToDelete(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>LV-Termin löschen?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 px-6 py-2">
              <p className="text-sm text-zinc-600">
                Möchten Sie den folgenden Termin wirklich löschen?
              </p>
              <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {sessionToDelete.title}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {format(sessionToDelete.date, "d. MMM yyyy, EEEE HH:mm", {
                    locale: de,
                  })}
                </p>
              </div>
              <p className="text-xs text-zinc-500">
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-3 pt-2">
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => setSessionToDelete(null)}
              >
                Abbrechen
              </Button>
              <Button
                className="flex-1"
                variant="destructive"
                onClick={() => {
                  handleDeleteSession(sessionToDelete.id);
                  setSessionToDelete(null);
                }}
              >
                Löschen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

type EditSessionDialogProps = {
  formState: EditSessionFormState;
  onFormStateChange: (state: EditSessionFormState) => void;
  onSave: () => void;
  onClose: () => void;
  mode: "edit" | "create";
};

function EditSessionDialog({
  formState,
  onFormStateChange,
  onSave,
  onClose,
  mode,
}: EditSessionDialogProps) {
  const isValid =
    formState.title.trim() &&
    formState.time &&
    formState.endTime &&
    formState.location.trim();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit"
              ? "LV-Termin bearbeiten"
              : "Neuen LV-Termin anlegen"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Titel
            </label>
            <Input
              value={formState.title}
              onChange={(e) =>
                onFormStateChange({ ...formState, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Datum
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full pl-3 pr-10 py-2 border border-zinc-200 rounded-lg text-left bg-white hover:border-zinc-300 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span
                    className={
                      formState.date ? "text-zinc-900" : "text-zinc-400"
                    }
                  >
                    {formState.date
                      ? format(formState.date, "EEEE, d. MMMM yyyy", {
                          locale: de,
                        })
                      : "Datum auswählen"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DatePickerCalendar
                  selected={formState.date}
                  onSelect={(date) =>
                    onFormStateChange({
                      ...formState,
                      date: date ?? new Date(),
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Startzeit
              </label>
              <TimeInput
                value={formState.time}
                onChange={(time) =>
                  onFormStateChange({ ...formState, time: time ?? "" })
                }
                placeholder="Startzeit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Endzeit
              </label>
              <TimeInput
                value={formState.endTime}
                onChange={(endTime) =>
                  onFormStateChange({ ...formState, endTime: endTime ?? "" })
                }
                placeholder="Endzeit"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Ort
            </label>
            <Input
              value={formState.location}
              onChange={(e) =>
                onFormStateChange({ ...formState, location: e.target.value })
              }
              placeholder="z.B. B309 oder Microsoft Teams"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Art des Ortes
              </label>
              <Select
                options={[
                  { value: "on-campus", label: "Vor Ort" },
                  { value: "online", label: "Online" },
                ]}
                value={formState.locationType}
                onChange={(value) =>
                  onFormStateChange({
                    ...formState,
                    locationType: value as LocationType,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Anwesenheit
              </label>
              <Select
                options={[
                  { value: "mandatory", label: "Verpflichtend" },
                  { value: "optional", label: "Optional" },
                ]}
                value={formState.attendance}
                onChange={(value) =>
                  onFormStateChange({
                    ...formState,
                    attendance: value as AttendanceType,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Notizen (optional)
            </label>
            <Textarea
              value={formState.notes}
              onChange={(e) =>
                onFormStateChange({ ...formState, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="flex-1" disabled={!isValid} onClick={onSave}>
              {mode === "edit" ? "Speichern" : "Anlegen"}
            </Button>
            <Button className="flex-1" variant="secondary" onClick={onClose}>
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
