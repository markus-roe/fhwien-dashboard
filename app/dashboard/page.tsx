"use client";

import { useMemo, useState } from "react";
import {
  mockSessions,
  mockCoachingSlots,
  mockCourses,
  type Session,
  type CoachingSlot,
  type LocationType,
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

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    mockCourses[0]?.id ?? ""
  );

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
            <CardContent className="p-3 sm:p-4 space-y-4">
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

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                {/* Sessions Verwaltung */}
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
                      {/* Desktop: Tabelle */}
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

                      {/* Mobile: Karten */}
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

                {/* Coaching Slots */}
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
