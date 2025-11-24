"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Tabs, Tab } from "@/components/ui/Tabs";
import { Plus, Users, BookOpen, Calendar, X, Search, Clock, Mail, Filter } from "lucide-react";
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
import { format, isAfter, isBefore, startOfToday } from "date-fns";
import { de } from "date-fns/locale";

type TabType = "my-groups" | "browse" | "appointments";

export default function GruppenPage() {
  const [activeTab, setActiveTab] = useState<TabType>("my-groups");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupMaxMembers, setNewGroupMaxMembers] = useState<number>(5);
  const [newGroupCourseId, setNewGroupCourseId] = useState<string>("");
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Get my groups (groups where user is a member)
  const myGroups = useMemo(() => {
    return groups.filter((g) => g.members.some((m) => m.id === currentUser.id));
  }, [groups]);

  // Get groups for selected course (or all groups if no course selected)
  const courseGroups = useMemo(() => {
    let filtered = selectedCourseId
      ? groups.filter((g) => g.courseId === selectedCourseId)
      : groups;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query) ||
          mockCourses.find((c) => c.id === g.courseId)?.title.toLowerCase().includes(query) ||
          g.members.some((m) => m.name.toLowerCase().includes(query) || m.initials.toLowerCase().includes(query) || m.email.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [selectedCourseId, groups, searchQuery]);

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

  // Get upcoming appointments (from all my groups)
  const upcomingAppointments = useMemo(() => {
    const myGroupIds = myGroups.map((g) => g.id);
    const appointments = groupSessions
      .filter((s) => s.groupId && myGroupIds.includes(s.groupId))
      .filter((s) => isAfter(s.date, startOfToday()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    return appointments;
  }, [groupSessions, myGroups]);

  // Get next appointment
  const nextAppointment = useMemo(() => {
    return upcomingAppointments[0] || null;
  }, [upcomingAppointments]);

  const handleCreateGroup = () => {
    const courseId = newGroupCourseId || selectedCourseId;
    if (!courseId || !newGroupName.trim()) return;

    const newGroup: Group = {
      id: `g${Date.now()}`,
      courseId: courseId,
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
    setNewGroupCourseId("");
    setIsCreateModalOpen(false);
    // Switch to my groups tab to see the new group
    setActiveTab("my-groups");
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

  // Helper function to get next appointment for a group
  const getNextGroupAppointment = (groupId: string) => {
    const appointments = groupSessions
      .filter((s) => s.groupId === groupId)
      .filter((s) => isAfter(s.date, startOfToday()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    return appointments[0] || null;
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full min-h-0">
        {/* Tabs */}
        <div className="mb-4 flex-shrink-0">
          <Tabs>
            <Tab
              active={activeTab === "my-groups"}
              onClick={() => setActiveTab("my-groups")}
            >
              Meine Gruppen ({myGroups.length})
            </Tab>
            <Tab
              active={activeTab === "browse"}
              onClick={() => setActiveTab("browse")}
            >
              Gruppen durchsuchen
            </Tab>
            <Tab
              active={activeTab === "appointments"}
              onClick={() => setActiveTab("appointments")}
            >
              Termine ({upcomingAppointments.length})
            </Tab>
          </Tabs>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 flex flex-col">
          {/* My Groups Tab */}
          {activeTab === "my-groups" && (
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
              {myGroups.length === 0 ? (
                <Card className="flex items-center justify-center min-h-[200px]">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-xs sm:text-sm text-zinc-500 mb-4">
                      Du bist noch in keiner Gruppe.
                    </p>
                    <Button
                      onClick={() => setActiveTab("browse")}
                      variant="secondary"
                      className="text-xs"
                    >
                      Gruppen durchsuchen
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myGroups.map((group) => {
                  const course = mockCourses.find((c) => c.id === group.courseId);
                  const nextAppt = getNextGroupAppointment(group.id);
                  const appointments = getGroupAppointments(group.id);

                  return (
                    <Card
                      key={group.id}
                      className="hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="default" className="text-xs">
                                {course?.title}
                              </Badge>
                              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 group-hover:text-[var(--primary)] transition-colors">
                                {group.name}
                              </h3>
                            </div>
                            {group.description && (
                              <p className="text-xs sm:text-sm text-zinc-600 mb-3">
                                {group.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-[10px] sm:text-xs text-zinc-500 flex-wrap">
                              <span>
                                {group.members.length}
                                {group.maxMembers
                                  ? ` / ${group.maxMembers}`
                                  : ""}{" "}
                                Mitglieder
                              </span>
                              {nextAppt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Nächster:{" "}
                                  {format(nextAppt.date, "d. MMM", {
                                    locale: de,
                                  })}{" "}
                                  {nextAppt.time}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              onClick={() => handleLeaveGroup(group.id)}
                              variant="ghost"
                              className="whitespace-nowrap text-xs"
                            >
                              Verlassen
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 sm:p-6 pb-4 sm:pb-6 space-y-4">
                        {/* Members List */}
                        <div className="border-t border-zinc-100 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] sm:text-xs font-medium text-zinc-500">
                              Mitglieder
                            </h4>
                            <div className="flex gap-1">
                              {group.members.slice(0, 5).map((member) => (
                                <Avatar
                                  key={member.id}
                                  initials={member.initials}
                                  className="w-7 h-7 text-xs"
                                />
                              ))}
                              {group.members.length > 5 && (
                                <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-600">
                                  +{group.members.length - 5}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {group.members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-2 hover:bg-zinc-50 p-2 rounded-md transition-colors"
                              >
                                <Avatar initials={member.initials} />
                                <div className="flex flex-col">
                                  <span className="text-xs sm:text-sm text-zinc-700">
                                    {member.name}
                                  </span>
                                  <a
                                    href={`mailto:${member.email}`}
                                    className="text-[10px] sm:text-xs text-zinc-500 hover:text-[var(--primary)] flex items-center gap-1 transition-colors"
                                  >
                                    <Mail className="w-3 h-3" />
                                    {member.email}
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Appointments Section */}
                        <div className="border-t border-zinc-100 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[10px] sm:text-xs font-medium text-zinc-500">
                              Termine ({appointments.length})
                            </h4>
                            <Button
                              onClick={() =>
                                handleOpenAppointmentModal(group.id)
                              }
                              variant="ghost"
                              className="text-[10px] sm:text-xs h-7 px-2"
                              icon={Plus}
                              iconPosition="left"
                            >
                              <span className="hidden sm:inline">Termin hinzufügen</span>
                              <span className="sm:hidden">Hinzufügen</span>
                            </Button>
                          </div>
                          {appointments.length === 0 ? (
                            <p className="text-[10px] sm:text-xs text-zinc-400 italic">
                              Noch keine Termine
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {appointments
                                .sort(
                                  (a, b) =>
                                    a.date.getTime() - b.date.getTime()
                                )
                                .map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    className={`flex items-center gap-2 text-[10px] sm:text-xs rounded-md p-2 transition-colors ${
                                      isAfter(appointment.date, startOfToday())
                                        ? "bg-zinc-50 hover:bg-zinc-100"
                                        : "bg-zinc-100 opacity-60"
                                    }`}
                                  >
                                    <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-zinc-900">
                                        {appointment.title}
                                      </div>
                                      <div className="text-zinc-500">
                                        {format(appointment.date, "d. MMM yyyy", {
                                          locale: de,
                                        })}{" "}
                                        • {appointment.time} -{" "}
                                        {appointment.endTime}
                                        {appointment.location && (
                                          <> • {appointment.location}</>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* Browse Tab */}
          {activeTab === "browse" && (
            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
              {/* Course List Sidebar */}
              <aside className="hidden lg:flex lg:flex-col lg:w-[280px] lg:shrink-0 space-y-3 lg:overflow-y-auto lg:max-h-full">
                <Card>
                  <CardContent className="px-4 sm:p-6 pb-4 sm:pb-6">
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCourseId(null)}
                        className={`w-full text-left p-3 rounded-lg transition-all border ${
                          !selectedCourseId
                            ? "bg-[var(--primary)] text-white border-transparent"
                            : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white"
                        }`}
                      >
                        <div className="text-sm font-semibold">Alle Fächer</div>
                      </button>
                      {mockCourses.map((course) => {
                        const groupCount = courseGroupCounts.get(course.id) || 0;
                        const isSelected = selectedCourseId === course.id;

                        return (
                          <button
                            key={course.id}
                            onClick={() => setSelectedCourseId(course.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all border ${
                          isSelected
                            ? "bg-[var(--primary)] text-white border-transparent"
                            : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white"
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
                    <h2 className="text-xs sm:text-sm font-medium text-zinc-900">Fächer</h2>
                  </CardHeader>
                  <CardContent className="px-4 sm:p-6 pb-4 sm:pb-6">
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCourseId(null)}
                        className={`w-full text-left p-3 rounded-lg transition-all border ${
                          !selectedCourseId
                            ? "bg-zinc-900 text-white border-transparent"
                            : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white"
                        }`}
                      >
                        <div className="text-sm font-semibold">Alle Fächer</div>
                      </button>
                      {mockCourses.map((course) => {
                        const groupCount = courseGroupCounts.get(course.id) || 0;
                        const isSelected = selectedCourseId === course.id;

                        return (
                          <button
                            key={course.id}
                            onClick={() => setSelectedCourseId(course.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all border ${
                          isSelected
                            ? "bg-zinc-900 text-white border-transparent"
                            : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white"
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

              {/* Groups List */}
              <div className="flex-1 min-w-0 w-full min-h-0 flex flex-col">
                <div className="flex flex-col h-full min-h-0 space-y-4">
                  <div className="flex items-center justify-between flex-shrink-0 gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Gruppen durchsuchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-xs sm:text-sm"
                      />
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
                        <p className="text-xs sm:text-sm text-zinc-500 mb-4">
                          {searchQuery
                            ? "Keine Gruppen gefunden."
                            : selectedCourseId
                            ? "Noch keine Gruppen für dieses Fach vorhanden."
                            : "Noch keine Gruppen vorhanden."}
                        </p>
                        <Button
                          onClick={() => setIsCreateModalOpen(true)}
                          icon={Plus}
                          iconPosition="left"
                          variant="secondary"
                          className="text-xs"
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
                        const course = mockCourses.find(
                          (c) => c.id === group.courseId
                        );
                        const nextAppt = getNextGroupAppointment(group.id);

                        return (
                          <Card
                            key={group.id}
                            className="hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group"
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Badge variant="default" className="text-xs">
                                      {course?.title}
                                    </Badge>
                                    <h3 className="text-base sm:text-lg font-semibold text-zinc-900 group-hover:text-[var(--primary)] transition-colors">
                                      {group.name}
                                    </h3>
                                  </div>
                                  {group.description && (
                                    <p className="text-xs sm:text-sm text-zinc-600 mb-3">
                                      {group.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-[10px] sm:text-xs text-zinc-500 flex-wrap">
                                    <span>
                                      {group.members.length}
                                      {group.maxMembers
                                        ? ` / ${group.maxMembers}`
                                        : ""}{" "}
                                      Mitglieder
                                    </span>
                                    {nextAppt && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Nächster:{" "}
                                        {format(nextAppt.date, "d. MMM", {
                                          locale: de,
                                        })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  {!userInGroup && !full && (
                                    <Button
                                      onClick={() => handleJoinGroup(group.id)}
                                      variant="secondary"
                                      className="whitespace-nowrap text-xs"
                                    >
                                      Beitreten
                                    </Button>
                                  )}
                                  {userInGroup && (
                                    <Button
                                      onClick={() => handleLeaveGroup(group.id)}
                                      variant="ghost"
                                      className="whitespace-nowrap text-xs"
                                    >
                                      Verlassen
                                    </Button>
                                  )}
                                  {!userInGroup && full && (
                                    <Button
                                      variant="ghost"
                                      className="whitespace-nowrap text-xs"
                                      disabled
                                    >
                                      Voll
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="px-4 sm:p-6 pb-4 sm:pb-6">
                              <div className="flex flex-wrap gap-2">
                                {group.members.slice(0, 8).map((member) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center gap-2 hover:bg-zinc-50 p-1.5 rounded-md transition-colors"
                                  >
                                    <Avatar initials={member.initials} />
                                    <span className="text-xs sm:text-sm text-zinc-700">
                                      {member.name}
                                    </span>
                                  </div>
                                ))}
                                {group.members.length > 8 && (
                                  <span className="text-xs sm:text-sm text-zinc-500 flex items-center h-8">
                                    +{group.members.length - 8} weitere
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
              {upcomingAppointments.length === 0 ? (
                <Card className="flex items-center justify-center min-h-[200px]">
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-xs sm:text-sm text-zinc-500">
                      Keine bevorstehenden Termine.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map((appointment) => {
                  const group = groups.find(
                    (g) => g.id === appointment.groupId
                  );
                  const course = group
                    ? mockCourses.find((c) => c.id === group.courseId)
                    : null;

                  return (
                    <Card key={appointment.id} className="hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer group">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {course && (
                                <Badge variant="default" className="text-xs">
                                  {course.title}
                                </Badge>
                              )}
                              {group && (
                                <Badge variant="blue" className="text-xs">
                                  {group.name}
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-sm sm:text-base font-semibold text-zinc-900 mb-2 group-hover:text-[var(--primary)] transition-colors">
                              {appointment.title}
                            </h3>
                            <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-zinc-600 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                {format(appointment.date, "EEEE, d. MMM yyyy", {
                                  locale: de,
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                {appointment.time} - {appointment.endTime}
                              </span>
                              {appointment.location && (
                                <span>{appointment.location}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
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
                  Fach *
                </label>
                <select
                  value={newGroupCourseId || selectedCourseId || ""}
                  onChange={(e) => {
                    setNewGroupCourseId(e.target.value);
                    if (!selectedCourseId) {
                      setSelectedCourseId(e.target.value || null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                >
                  <option value="">Fach auswählen</option>
                  {mockCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
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
                  disabled={!newGroupName.trim() || !(newGroupCourseId || selectedCourseId)}
                >
                  Erstellen
                </Button>
                <Button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewGroupName("");
                    setNewGroupDescription("");
                    setNewGroupMaxMembers(5);
                    setNewGroupCourseId("");
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
