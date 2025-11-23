"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Plus, Users, BookOpen, Calendar, X } from "lucide-react";
import {
  mockGroups,
  mockCourses,
  currentUser,
  Program,
  type Group,
  type Course,
  type Session,
} from "@/data/mockData";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function GruppenPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupMaxMembers, setNewGroupMaxMembers] = useState<number>(5);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [groupSessions, setGroupSessions] = useState<Session[]>(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("groupSessions");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.map((s: any) => ({
            ...s,
            date: new Date(s.date),
          }));
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [appointmentTitle, setAppointmentTitle] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentEndTime, setAppointmentEndTime] = useState("");
  const [appointmentLocation, setAppointmentLocation] = useState("");
  const [appointmentLocationType, setAppointmentLocationType] = useState<
    "online" | "on-campus"
  >("online");

  // Get groups for selected course
  const courseGroups = useMemo(() => {
    if (!selectedCourseId) return [];
    return groups.filter((g) => g.courseId === selectedCourseId);
  }, [selectedCourseId, groups]);

  const selectedCourse = selectedCourseId
    ? mockCourses.find((c) => c.id === selectedCourseId)
    : null;

  // Get group count per course
  const courseGroupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    groups.forEach((group) => {
      counts.set(group.courseId, (counts.get(group.courseId) || 0) + 1);
    });
    return counts;
  }, [groups]);

  const handleCreateGroup = () => {
    if (!selectedCourseId || !newGroupName.trim()) return;

    const newGroup: Group = {
      id: `g${Date.now()}`,
      courseId: selectedCourseId,
      name: newGroupName,
      description: newGroupDescription || undefined,
      maxMembers: newGroupMaxMembers || undefined,
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          initials: currentUser.initials,
          email: currentUser.email,
          program: currentUser.program,
        },
      ],
      createdAt: new Date(),
    };

    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setNewGroupDescription("");
    setNewGroupMaxMembers(5);
    setIsCreateModalOpen(false);
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(
      groups.map((group) => {
        if (group.id === groupId) {
          const isAlreadyMember = group.members.some(
            (m) => m.id === currentUser.id
          );
          if (isAlreadyMember) return group;

          if (group.maxMembers && group.members.length >= group.maxMembers) {
            return group; // Group is full
          }

          return {
            ...group,
            members: [
              ...group.members,
              {
                id: currentUser.id,
                name: currentUser.name,
                initials: currentUser.initials,
                email: currentUser.email,
                program: currentUser.program,
              },
            ],
          };
        }
        return group;
      })
    );
  };

  const handleLeaveGroup = (groupId: string) => {
    setGroups(
      groups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.filter((m) => m.id !== currentUser.id),
          };
        }
        return group;
      })
    );
  };

  const isUserInGroup = (group: Group) => {
    return group.members.some((m) => m.id === currentUser.id);
  };

  const isGroupFull = (group: Group) => {
    return group.maxMembers ? group.members.length >= group.maxMembers : false;
  };

  const handleOpenAppointmentModal = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsAppointmentModalOpen(true);
    setAppointmentTitle("");
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentEndTime("");
    setAppointmentLocation("");
    setAppointmentLocationType("online");
  };

  const handleCreateAppointment = () => {
    if (
      !selectedGroupId ||
      !appointmentTitle.trim() ||
      !appointmentDate ||
      !appointmentTime ||
      !appointmentEndTime
    )
      return;

    const selectedGroup = groups.find((g) => g.id === selectedGroupId);
    if (!selectedGroup) return;

    const course = mockCourses.find((c) => c.id === selectedGroup.courseId);
    if (!course) return;

    // Parse date and time
    const [year, month, day] = appointmentDate.split("-").map(Number);
    const [startHours, startMinutes] = appointmentTime.split(":").map(Number);
    const [endHours, endMinutes] = appointmentEndTime.split(":").map(Number);

    const appointmentDateObj = new Date(
      year,
      month - 1,
      day,
      startHours,
      startMinutes
    );
    const endDateObj = new Date(year, month - 1, day, endHours, endMinutes);

    // Calculate duration
    const durationMs = endDateObj.getTime() - appointmentDateObj.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor(
      (durationMs % (1000 * 60 * 60)) / (1000 * 60)
    );
    const duration =
      durationHours > 0
        ? `${durationHours}h ${durationMinutes}m`
        : `${durationMinutes}m`;

    const newSession: Session = {
      id: `gs${Date.now()}`,
      courseId: selectedGroup.courseId,
      type: "coaching",
      title: appointmentTitle,
      program: course.program,
      date: appointmentDateObj,
      time: appointmentTime,
      endTime: appointmentEndTime,
      duration: duration,
      location:
        appointmentLocation ||
        (appointmentLocationType === "online" ? "Online" : ""),
      locationType: appointmentLocationType,
      attendance: "optional",
      objectives: [],
      materials: [],
      groupId: selectedGroupId,
    };

    const updatedSessions = [...groupSessions, newSession];
    setGroupSessions(updatedSessions);

    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "groupSessions",
        JSON.stringify(
          updatedSessions.map((s) => ({
            ...s,
            date: s.date.toISOString(),
          }))
        )
      );
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event("groupSessionsUpdated"));
    }

    setIsAppointmentModalOpen(false);
    setSelectedGroupId(null);
    setAppointmentTitle("");
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentEndTime("");
    setAppointmentLocation("");
    setAppointmentLocationType("online");
  };

  const getGroupAppointments = (groupId: string) => {
    return groupSessions.filter((s) => s.groupId === groupId);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex flex-col lg:flex-row gap-4 w-full flex-1 min-h-0">
          {/* Left Column - Course List */}
          <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 space-y-3 lg:overflow-y-auto lg:max-h-full">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-zinc-900">Fächer</h2>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-2">
                  {mockCourses.map((course) => {
                    const groupCount = courseGroupCounts.get(course.id) || 0;
                    const isSelected = selectedCourseId === course.id;

                    return (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isSelected
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-50 border border-zinc-200 hover:border-zinc-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-semibold ${
                                isSelected ? "text-white" : "text-zinc-900"
                              }`}
                            >
                              {course.title}
                            </div>
                          </div>
                          {groupCount > 0 && (
                            <Badge variant="default" className="ml-2 shrink-0">
                              {groupCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Mobile Course Selector */}
          <div className="lg:hidden">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-zinc-900">Fächer</h2>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="space-y-2">
                  {mockCourses.map((course) => {
                    const groupCount = courseGroupCounts.get(course.id) || 0;
                    const isSelected = selectedCourseId === course.id;

                    return (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isSelected
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-50 border border-zinc-200 hover:border-zinc-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-semibold ${
                                isSelected ? "text-white" : "text-zinc-900"
                              }`}
                            >
                              {course.title}
                            </div>
                          </div>
                          {groupCount > 0 && (
                            <Badge variant="default" className="ml-2 shrink-0">
                              {groupCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Groups */}
          <div className="flex-1 min-w-0 w-full min-h-0 flex flex-col">
            {selectedCourse ? (
              <div className="flex flex-col h-full min-h-0 space-y-4">
                <div className="flex items-center justify-between flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      Gruppen für {selectedCourse.title}
                    </h2>
                  </div>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    icon={Plus}
                    iconPosition="left"
                    className="shrink-0"
                  >
                    <span className="hidden sm:inline">Neue Gruppe</span>
                    <span className="sm:hidden">Neu</span>
                  </Button>
                </div>

                {courseGroups.length === 0 ? (
                  <Card className="flex-1 flex items-center justify-center">
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                      <p className="text-sm text-zinc-500 mb-4">
                        Noch keine Gruppen für dieses Fach vorhanden.
                      </p>
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        icon={Plus}
                        iconPosition="left"
                        variant="secondary"
                      >
                        Erste Gruppe erstellen
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
                    {courseGroups.map((group) => {
                      const userInGroup = isUserInGroup(group);
                      const full = isGroupFull(group);

                      return (
                        <Card key={group.id} className="hover:border-zinc-300 transition-colors">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <h3 className="text-lg font-semibold text-zinc-900">
                                    {group.name}
                                  </h3>
                                </div>
                                {group.description && (
                                  <p className="text-sm text-zinc-600 mb-3">
                                    {group.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                                  <span>
                                    {group.members.length}
                                    {group.maxMembers
                                      ? ` / ${group.maxMembers}`
                                      : ""}{" "}
                                    Mitglieder
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                {!userInGroup && !full && (
                                  <Button
                                    onClick={() => handleJoinGroup(group.id)}
                                    variant="secondary"
                                    className="whitespace-nowrap"
                                  >
                                    Beitreten
                                  </Button>
                                )}
                                {userInGroup && (
                                  <Button
                                    onClick={() => handleLeaveGroup(group.id)}
                                    variant="ghost"
                                    className="whitespace-nowrap"
                                  >
                                    Verlassen
                                  </Button>
                                )}
                                {!userInGroup && full && (
                                  <Button
                                    variant="ghost"
                                    className="whitespace-nowrap"
                                    disabled
                                  >
                                    Voll
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                            {/* Members List */}
                            <div className="border-t border-zinc-100 pt-4">
                              <h4 className="text-xs font-medium text-zinc-500 mb-3">
                                Mitglieder
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                {group.members.map((member) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Avatar initials={member.initials} />
                                    <span className="text-sm text-zinc-700">
                                      {member.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Appointments Section */}
                            {userInGroup && (
                              <div className="border-t border-zinc-100 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-medium text-zinc-500">
                                    Termine
                                  </h4>
                                  <Button
                                    onClick={() =>
                                      handleOpenAppointmentModal(group.id)
                                    }
                                    variant="ghost"
                                    className="text-xs h-7 px-2"
                                    icon={Plus}
                                    iconPosition="left"
                                  >
                                    <span className="hidden sm:inline">Termin hinzufügen</span>
                                    <span className="sm:hidden">Hinzufügen</span>
                                  </Button>
                                </div>
                                {getGroupAppointments(group.id).length === 0 ? (
                                  <p className="text-xs text-zinc-400 italic">
                                    Noch keine Termine
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {getGroupAppointments(group.id).map(
                                      (appointment) => (
                                        <div
                                          key={appointment.id}
                                          className="flex items-center gap-2 text-xs bg-zinc-50 rounded-md p-2"
                                        >
                                          <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-zinc-900">
                                              {appointment.title}
                                            </div>
                                            <div className="text-zinc-500">
                                              {format(
                                                appointment.date,
                                                "d. MMM yyyy",
                                                { locale: de }
                                              )}{" "}
                                              • {appointment.time} -{" "}
                                              {appointment.endTime}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Card className="flex-1 flex items-center justify-center">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                  <p className="text-sm text-zinc-500">
                    Wähle ein Fach aus, um Gruppen anzuzeigen oder zu erstellen.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create Group Dialog */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Gruppe erstellen</DialogTitle>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogHeader>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Gruppenname *
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="z.B. Gruppe A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Beschreibung (optional)
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="Beschreibung der Gruppe..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Maximale Mitglieder (optional)
                </label>
                <input
                  type="number"
                  value={newGroupMaxMembers}
                  onChange={(e) =>
                    setNewGroupMaxMembers(parseInt(e.target.value) || 0)
                  }
                  min="1"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="Leer lassen für unbegrenzt"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateGroup}
                  className="flex-1"
                  disabled={!newGroupName.trim()}
                >
                  Erstellen
                </Button>
                <Button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewGroupName("");
                    setNewGroupDescription("");
                    setNewGroupMaxMembers(5);
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Appointment Dialog */}
        <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Termin hinzufügen</DialogTitle>
              <button
                onClick={() => setIsAppointmentModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogHeader>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  value={appointmentTitle}
                  onChange={(e) => setAppointmentTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  placeholder="z.B. Coaching Termin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Datum *
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Startzeit *
                  </label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Endzeit *
                  </label>
                  <input
                    type="time"
                    value={appointmentEndTime}
                    onChange={(e) => setAppointmentEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Art
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAppointmentLocationType("online")}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors ${
                      appointmentLocationType === "online"
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppointmentLocationType("on-campus")}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors ${
                      appointmentLocationType === "on-campus"
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    Vor Ort
                  </button>
                </div>
              </div>
              {appointmentLocationType === "on-campus" && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Ort
                  </label>
                  <input
                    type="text"
                    value={appointmentLocation}
                    onChange={(e) => setAppointmentLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    placeholder="z.B. Raum B309"
                  />
                </div>
              )}
              {appointmentLocationType === "online" && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Link (optional)
                  </label>
                  <input
                    type="text"
                    value={appointmentLocation}
                    onChange={(e) => setAppointmentLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                    placeholder="z.B. Microsoft Teams Link"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateAppointment}
                  className="flex-1"
                  disabled={
                    !appointmentTitle.trim() ||
                    !appointmentDate ||
                    !appointmentTime ||
                    !appointmentEndTime
                  }
                >
                  Erstellen
                </Button>
                <Button
                  onClick={() => {
                    setIsAppointmentModalOpen(false);
                    setSelectedGroupId(null);
                    setAppointmentTitle("");
                    setAppointmentDate("");
                    setAppointmentTime("");
                    setAppointmentEndTime("");
                    setAppointmentLocation("");
                    setAppointmentLocationType("online");
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
