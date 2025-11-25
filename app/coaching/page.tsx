"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Calendar } from "lucide-react";
import {
  mockCoachingSlots,
  mockCourses,
  currentUser,
  type CoachingSlot,
  type Session,
  type LocationType,
} from "@/data/mockData";
import { CreateCoachingSlotDialog } from "@/components/coaching/CreateCoachingSlotDialog";
import { CoachingSlotCard } from "@/components/coaching/CoachingSlotCard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Select, type SelectOption } from "@/components/ui/Select";
import { useSessionPanel } from "@/components/schedule/hooks/useSessionPanel";
import { SessionPanel } from "@/components/schedule/SessionPanel";
import { getWeek, startOfWeek, endOfWeek, format, isSameDay } from "date-fns";
import { de } from "date-fns/locale";

export default function CoachingPage() {
  const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
    useSessionPanel();
  const [slots, setSlots] = useState<CoachingSlot[]>(mockCoachingSlots);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">(
    "upcoming"
  );

  const isProfessor = currentUser.role === "professor";

  const courseOptions: SelectOption[] = [
    { value: "", label: "Alle Kurse" },
    ...mockCourses.map((course) => ({
      value: course.id,
      label: course.title,
    })),
  ];

  const filteredSlots = useMemo(() => {
    let filtered = slots;

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((slot) => slot.courseId === selectedCourseId);
    }

    // Filter by date
    const now = new Date();
    if (dateFilter === "upcoming") {
      filtered = filtered.filter((slot) => {
        const slotDateTime = new Date(slot.date);
        slotDateTime.setHours(
          parseInt(slot.time.split(":")[0]),
          parseInt(slot.time.split(":")[1])
        );
        return slotDateTime >= now;
      });
    } else if (dateFilter === "past") {
      filtered = filtered.filter((slot) => {
        const slotDateTime = new Date(slot.date);
        slotDateTime.setHours(
          parseInt(slot.time.split(":")[0]),
          parseInt(slot.time.split(":")[1])
        );
        return slotDateTime < now;
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      return a.time.localeCompare(b.time);
    });

    return filtered;
  }, [slots, selectedCourseId, dateFilter]);

  const mySlots = useMemo(() => {
    return filteredSlots.filter((slot) =>
      slot.participants.some((p) => p === currentUser.name)
    );
  }, [filteredSlots]);

  const availableSlots = useMemo(() => {
    return filteredSlots.filter(
      (slot) => slot.participants.length < slot.maxParticipants
    );
  }, [filteredSlots, isProfessor]);

  const mySlotsByWeek = useMemo(() => {
    return groupSlotsByWeek(mySlots);
  }, [mySlots]);

  const availableSlotsByWeek = useMemo(() => {
    return groupSlotsByWeek(availableSlots);
  }, [availableSlots]);

  const handleCreateSlot = (slotData: {
    courseId: string;
    date: Date;
    time: string;
    endTime: string;
    location: string;
    locationType: "online" | "on-campus";
    maxParticipants: number;
    description?: string;
  }) => {
    const professor = {
      name: currentUser.name,
      initials: currentUser.initials,
    };

    const newSlot: CoachingSlot = {
      id: `cs${Date.now()}`,
      courseId: slotData.courseId,
      date: slotData.date,
      time: slotData.time,
      endTime: slotData.endTime,
      duration: calculateDuration(slotData.time, slotData.endTime),
      maxParticipants: slotData.maxParticipants,
      participants: [],
      description: slotData.description,
      createdAt: new Date(),
    };

    setSlots((prev) => [...prev, newSlot]);
    setIsCreateDialogOpen(false);
  };

  const handleBookSlot = (slotId: string) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId) return slot;
        if (slot.participants.length >= slot.maxParticipants) return slot;
        if (slot.participants.some((p) => p === currentUser.name)) return slot;

        return {
          ...slot,
          participants: [...slot.participants, currentUser.name],
        };
      })
    );
  };

  const handleCancelBooking = (slotId: string) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId) return slot;
        return {
          ...slot,
          participants: slot.participants.filter((p) => p !== currentUser.name),
        };
      })
    );
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const handleSessionClick = (session: Session) => {
    // Check if it's a coaching slot or regular session
    const slot = slots.find((s) => s.id === session.id);
    if (slot) {
      // Convert coaching slot to session format
      const course = mockCourses.find((c) => c.id === slot.courseId);
      const sessionForPanel = {
        id: slot.id,
        courseId: slot.courseId,
        type: "coaching" as const,
        title: course ? `${course.title} Coaching` : "Coaching",
        program: course?.program || "DTI",
        date: slot.date,
        time: slot.time,
        endTime: slot.endTime,
        duration: slot.duration,
        location: "Online",
        locationType: "online" as LocationType,
        attendance: "optional" as const,
        objectives: [],
        materials: [],
        participants: slot.participants.length,
      };
      openSessionPanel(sessionForPanel);
    } else {
      // It's a regular session
      openSessionPanel(session);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-auto">
          <Sidebar
            showCalendar={true}
            showNextUpCard={false}
            onSessionClick={handleSessionClick}
            emptyMessage={
              isProfessor
                ? "Noch keine Coaching-Slots erstellt."
                : "Noch keine Coaching-Slots gebucht."
            }
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                Coaching
              </h1>
            </div>
            {isProfessor && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                icon={Plus}
                iconPosition="left"
                className="w-full sm:w-auto text-sm"
              >
                Neuer Slot
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <Select
                    options={courseOptions}
                    value={selectedCourseId || ""}
                    onChange={(value) => setSelectedCourseId(value || null)}
                    placeholder="Alle Kurse"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={dateFilter === "all" ? "primary" : "secondary"}
                    onClick={() => setDateFilter("all")}
                    className="w-full sm:w-auto text-sm px-3"
                  >
                    Alle
                  </Button>
                  <Button
                    variant={
                      dateFilter === "upcoming" ? "primary" : "secondary"
                    }
                    onClick={() => setDateFilter("upcoming")}
                    className="w-full sm:w-auto text-sm px-3"
                  >
                    Kommend
                  </Button>
                  <Button
                    variant={dateFilter === "past" ? "primary" : "secondary"}
                    onClick={() => setDateFilter("past")}
                    className="w-full sm:w-auto text-sm px-3"
                  >
                    Vergangen
                  </Button>
                </div>
              </div>

              {isProfessor && mySlots.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-base font-semibold text-zinc-900">
                    Meine Slots
                  </h2>
                  {mySlotsByWeek.map((weekGroup) => (
                    <div key={weekGroup.weekKey} className="space-y-4">
                      <h3 className="text-sm font-medium text-zinc-700">
                        {weekGroup.weekLabel}
                      </h3>
                      {weekGroup.days.map((dayGroup) => (
                        <div key={dayGroup.dayKey} className="space-y-3">
                          <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                            {dayGroup.dayLabel}
                          </h4>
                          {dayGroup.timeGroups.map((timeGroup) => (
                            <div key={timeGroup.timeKey} className="space-y-2">
                              <h5 className="text-xs font-medium text-zinc-500">
                                {timeGroup.timeLabel}
                              </h5>
                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {timeGroup.slots.map((slot) => (
                                  <div key={slot.id} id={`slot-${slot.id}`}>
                                    <CoachingSlotCard
                                      slot={slot}
                                      course={mockCourses.find(
                                        (c) => c.id === slot.courseId
                                      )}
                                      isProfessor={true}
                                      onBook={handleBookSlot}
                                      onCancelBooking={handleCancelBooking}
                                      onDelete={handleDeleteSlot}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {!isProfessor && mySlots.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-base font-semibold text-zinc-900">
                    Meine Buchungen
                  </h2>
                  {mySlotsByWeek.map((weekGroup) => (
                    <div key={weekGroup.weekKey} className="space-y-4">
                      <h3 className="text-sm font-medium text-zinc-700">
                        {weekGroup.weekLabel}
                      </h3>
                      {weekGroup.days.map((dayGroup) => (
                        <div key={dayGroup.dayKey} className="space-y-3">
                          <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                            {dayGroup.dayLabel}
                          </h4>
                          {dayGroup.timeGroups.map((timeGroup) => (
                            <div key={timeGroup.timeKey} className="space-y-2">
                              <h5 className="text-xs font-medium text-zinc-500">
                                {timeGroup.timeLabel}
                              </h5>
                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {timeGroup.slots.map((slot) => (
                                  <div key={slot.id} id={`slot-${slot.id}`}>
                                    <CoachingSlotCard
                                      slot={slot}
                                      course={mockCourses.find(
                                        (c) => c.id === slot.courseId
                                      )}
                                      isProfessor={false}
                                      onBook={handleBookSlot}
                                      onCancelBooking={handleCancelBooking}
                                      onDelete={handleDeleteSlot}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {!isProfessor && availableSlots.length > 0 && (
                <div
                  className={`space-y-6 ${mySlots.length > 0 ? "mt-6" : ""}`}
                >
                  <h2 className="text-base font-semibold text-zinc-900">
                    Verfügbare Slots
                  </h2>
                  {availableSlotsByWeek.map((weekGroup) => (
                    <div key={weekGroup.weekKey} className="space-y-4">
                      <h3 className="text-sm font-medium text-zinc-700">
                        {weekGroup.weekLabel}
                      </h3>
                      {weekGroup.days.map((dayGroup) => (
                        <div key={dayGroup.dayKey} className="space-y-3">
                          <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                            {dayGroup.dayLabel}
                          </h4>
                          {dayGroup.timeGroups.map((timeGroup) => (
                            <div key={timeGroup.timeKey} className="space-y-2">
                              <h5 className="text-xs font-medium text-zinc-500">
                                {timeGroup.timeLabel}
                              </h5>
                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {timeGroup.slots.map((slot) => (
                                  <div key={slot.id} id={`slot-${slot.id}`}>
                                    <CoachingSlotCard
                                      slot={slot}
                                      course={mockCourses.find(
                                        (c) => c.id === slot.courseId
                                      )}
                                      isProfessor={false}
                                      onBook={handleBookSlot}
                                      onCancelBooking={handleCancelBooking}
                                      onDelete={handleDeleteSlot}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {filteredSlots.length === 0 && (
                <div className="p-8 text-center">
                  <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">
                    {isProfessor
                      ? "Keine Coaching-Slots gefunden. Erstellen Sie einen neuen Slot."
                      : "Keine verfügbaren Coaching-Slots gefunden."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateCoachingSlotDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        courses={mockCourses}
        onSubmit={handleCreateSlot}
      />
      <SessionPanel
        session={selectedSession}
        isOpen={isPanelOpen}
        onClose={closeSessionPanel}
      />
    </div>
  );
}

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

type TimeGroup = {
  timeKey: string;
  timeLabel: string;
  slots: CoachingSlot[];
};

type DayGroup = {
  dayKey: string;
  dayLabel: string;
  date: Date;
  timeGroups: TimeGroup[];
};

type WeekGroup = {
  weekKey: string;
  weekLabel: string;
  days: DayGroup[];
};

function groupSlotsByWeek(slots: CoachingSlot[]): WeekGroup[] {
  const weekMap = new Map<string, CoachingSlot[]>();

  slots.forEach((slot) => {
    const slotDate = new Date(slot.date);
    const weekNumber = getWeek(slotDate, { weekStartsOn: 1, locale: de });
    const year = slotDate.getFullYear();
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, "0")}`;

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, []);
    }
    weekMap.get(weekKey)!.push(slot);
  });

  // Convert to array and sort chronologically
  const weekGroups: WeekGroup[] = Array.from(weekMap.entries()).map(
    ([weekKey, weekSlots]) => {
      const firstSlotDate = new Date(weekSlots[0].date);
      const weekStart = startOfWeek(firstSlotDate, {
        weekStartsOn: 1,
        locale: de,
      });
      const weekEnd = endOfWeek(firstSlotDate, { weekStartsOn: 1, locale: de });
      const weekNumber = getWeek(firstSlotDate, {
        weekStartsOn: 1,
        locale: de,
      });
      const year = firstSlotDate.getFullYear();

      const weekLabel = `KW ${weekNumber}, ${year} (${format(
        weekStart,
        "d. MMM",
        { locale: de }
      )} - ${format(weekEnd, "d. MMM", { locale: de })})`;

      // Sort slots within week by date and time
      weekSlots.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.time.localeCompare(b.time);
      });

      // Group slots by day within the week
      const dayMap = new Map<string, CoachingSlot[]>();
      weekSlots.forEach((slot) => {
        const slotDate = new Date(slot.date);
        const dayKey = format(slotDate, "yyyy-MM-dd");

        if (!dayMap.has(dayKey)) {
          dayMap.set(dayKey, []);
        }
        dayMap.get(dayKey)!.push(slot);
      });

      // Convert day map to array and sort, then group by time
      const days: DayGroup[] = Array.from(dayMap.entries())
        .map(([dayKey, daySlots]) => {
          const dayDate = new Date(daySlots[0].date);

          // Sort slots by time
          daySlots.sort((a, b) => a.time.localeCompare(b.time));

          // Group slots by time
          const timeMap = new Map<string, CoachingSlot[]>();
          daySlots.forEach((slot) => {
            const timeKey = slot.time;
            if (!timeMap.has(timeKey)) {
              timeMap.set(timeKey, []);
            }
            timeMap.get(timeKey)!.push(slot);
          });

          // Convert time map to array and sort
          const timeGroups: TimeGroup[] = Array.from(timeMap.entries())
            .map(([timeKey, timeSlots]) => ({
              timeKey,
              timeLabel: `${timeKey} - ${timeSlots[0].endTime}`,
              slots: timeSlots,
            }))
            .sort((a, b) => a.timeKey.localeCompare(b.timeKey));

          return {
            dayKey,
            dayLabel: format(dayDate, "EEEE, d. MMMM", { locale: de }),
            date: dayDate,
            timeGroups,
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      return {
        weekKey,
        weekLabel,
        days,
      };
    }
  );

  // Sort weeks chronologically
  weekGroups.sort((a, b) => {
    return a.weekKey.localeCompare(b.weekKey);
  });

  return weekGroups;
}
