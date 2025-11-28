"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  mockCoachingSlots,
  mockCourses,
  currentUser,
  type CoachingSlot,
  type Session,
  type LocationType,
} from "@/data/mockData";
import { CoachingSlotCard } from "@/components/coaching/CoachingSlotCard";
import { Sidebar } from "@/components/layout/Sidebar";
import { useSessionPanel } from "@/components/schedule/hooks/useSessionPanel";
import { SessionPanel } from "@/components/schedule/SessionPanel";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { CourseFilterButtons } from "@/components/groups/CourseFilterButtons";
import { Input } from "@/components/ui/Input";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CoachingPage() {
  const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
    useSessionPanel();
  const [slots, setSlots] = useState<CoachingSlot[]>(mockCoachingSlots);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeStudentTab, setActiveStudentTab] = useState<
    "myBookings" | "available"
  >("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPastSlots, setShowPastSlots] = useState(false);

  // Separate upcoming and past slots
  const { upcomingSlots, pastSlots } = useMemo(() => {
    const now = new Date();
    const upcoming: CoachingSlot[] = [];
    const past: CoachingSlot[] = [];

    slots.forEach((slot) => {
      const slotDateTime = new Date(slot.date);
      slotDateTime.setHours(
        parseInt(slot.time.split(":")[0]),
        parseInt(slot.time.split(":")[1])
      );
      if (slotDateTime >= now) {
        upcoming.push(slot);
      } else {
        past.push(slot);
      }
    });

    return { upcomingSlots: upcoming, pastSlots: past };
  }, [slots]);

  // For badge counts, only use upcoming slots
  const totalSlotCount = upcomingSlots.length;

  const courseSlotCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockCourses.forEach((course) => {
      counts[course.id] = 0;
    });
    upcomingSlots.forEach((slot) => {
      counts[slot.courseId] = (counts[slot.courseId] ?? 0) + 1;
    });
    return counts;
  }, [upcomingSlots]);

  // Filter upcoming slots
  const filteredUpcomingSlots = useMemo(() => {
    let filtered = [...upcomingSlots];

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((slot) => slot.courseId === selectedCourseId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((slot) => {
        const course = mockCourses.find((c) => c.id === slot.courseId);
        return (
          course?.title.toLowerCase().includes(query) ||
          slot.participants.some((p) => p.toLowerCase().includes(query))
        );
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
  }, [upcomingSlots, selectedCourseId, searchQuery]);

  // Filter past slots
  const filteredPastSlots = useMemo(() => {
    let filtered = [...pastSlots];

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((slot) => slot.courseId === selectedCourseId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((slot) => {
        const course = mockCourses.find((c) => c.id === slot.courseId);
        return (
          course?.title.toLowerCase().includes(query) ||
          slot.participants.some((p) => p.toLowerCase().includes(query))
        );
      });
    }

    // Sort by date (descending for past slots)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      return b.time.localeCompare(a.time);
    });

    return filtered;
  }, [pastSlots, selectedCourseId, searchQuery]);

  const myUpcomingSlots = useMemo(() => {
    return filteredUpcomingSlots.filter((slot) =>
      slot.participants.some((p) => p === currentUser.name)
    );
  }, [filteredUpcomingSlots]);

  const totalMyBookingsCount = useMemo(() => {
    return upcomingSlots.filter((slot) =>
      slot.participants.some((p) => p === currentUser.name)
    ).length;
  }, [upcomingSlots]);

  const myPastSlots = useMemo(() => {
    return filteredPastSlots.filter((slot) =>
      slot.participants.some((p) => p === currentUser.name)
    );
  }, [filteredPastSlots]);

  const availableSlots = useMemo(() => {
    // "Alle Coachings" zeigt alle Slots, nicht nur die verfügbaren
    return filteredUpcomingSlots;
  }, [filteredUpcomingSlots]);

  const myUpcomingSlotsByDay = useMemo(() => {
    return groupSlotsByDay(myUpcomingSlots);
  }, [myUpcomingSlots]);

  const myPastSlotsByDay = useMemo(() => {
    return groupSlotsByDay(myPastSlots);
  }, [myPastSlots]);

  const availableSlotsByDay = useMemo(() => {
    return groupSlotsByDay(availableSlots);
  }, [availableSlots]);

  const pastSlotsByDay = useMemo(() => {
    return groupSlotsByDay(filteredPastSlots);
  }, [filteredPastSlots]);

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
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
          <Sidebar
            showCalendar={true}
            showNextUpCard={false}
            onSessionClick={handleSessionClick}
            emptyMessage={"Noch keine Coaching-Slots gebucht."}
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-3">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                  Coaching Termine
                </h1>
              </div>
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Coachings durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Student: switch zwischen "Verfügbare Slots" und "Meine Buchungen" */}
              <SegmentedTabs
                value={activeStudentTab}
                onChange={(value) =>
                  setActiveStudentTab(value as "myBookings" | "available")
                }
                options={[
                  {
                    value: "available",
                    label: "Alle Coachings",
                    badge: totalSlotCount > 0 ? totalSlotCount : undefined,
                  },
                  {
                    value: "myBookings",
                    label: "Meine Buchungen",
                    badge:
                      totalMyBookingsCount > 0
                        ? totalMyBookingsCount
                        : undefined,
                  },
                ]}
                className="mb-4"
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-[200px] shrink-0 space-y-3">
                  <CourseFilterButtons
                    courses={mockCourses}
                    selectedCourseId={selectedCourseId}
                    onSelectCourse={setSelectedCourseId}
                    totalGroupCount={totalSlotCount}
                    courseGroupCounts={courseSlotCounts}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {/* Student-Ansicht: tab-basierte Darstellung */}
                  {activeStudentTab === "myBookings" && (
                    <div className="space-y-6">
                      {myUpcomingSlots.length === 0 &&
                      myPastSlots.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                          <p className="text-sm text-zinc-600 mb-1">
                            Du hast aktuell keine gebuchten Coaching-Slots.
                          </p>
                          <p className="text-xs text-zinc-500">
                            Wechsle zur Ansicht{" "}
                            <span className="font-medium">
                              &quot;Alle Coachings&quot;
                            </span>{" "}
                            um einen Termin zu buchen.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Upcoming slots */}
                          {myUpcomingSlotsByDay.length > 0 &&
                            myUpcomingSlotsByDay.map((dayGroup) => (
                              <div key={dayGroup.dayKey} className="space-y-3">
                                <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                                  {dayGroup.dayLabel}
                                </h4>
                                {dayGroup.timeGroups.map((timeGroup) => (
                                  <div
                                    key={timeGroup.timeKey}
                                    className="space-y-2"
                                  >
                                    <h5 className="text-xs font-medium text-zinc-500">
                                      {timeGroup.timeLabel}
                                    </h5>
                                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                                      {timeGroup.slots.map((slot) => (
                                        <div
                                          key={slot.id}
                                          id={`slot-${slot.id}`}
                                        >
                                          <CoachingSlotCard
                                            slot={slot}
                                            course={mockCourses.find(
                                              (c) => c.id === slot.courseId
                                            )}
                                            isProfessor={false}
                                            onBook={handleBookSlot}
                                            onCancelBooking={
                                              handleCancelBooking
                                            }
                                            onDelete={handleDeleteSlot}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}

                          {/* Past slots - collapsible */}
                          {myPastSlotsByDay.length > 0 && (
                            <div className="space-y-4">
                              <button
                                onClick={() => setShowPastSlots(!showPastSlots)}
                                className="flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                              >
                                {showPastSlots ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                                <span>
                                  Vergangene Buchungen ({myPastSlots.length})
                                </span>
                              </button>
                              {showPastSlots &&
                                myPastSlotsByDay.map((dayGroup) => (
                                  <div
                                    key={dayGroup.dayKey}
                                    className="space-y-3 opacity-60"
                                  >
                                    <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                                      {dayGroup.dayLabel}
                                    </h4>
                                    {dayGroup.timeGroups.map((timeGroup) => (
                                      <div
                                        key={timeGroup.timeKey}
                                        className="space-y-2"
                                      >
                                        <h5 className="text-xs font-medium text-zinc-500">
                                          {timeGroup.timeLabel}
                                        </h5>
                                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                                          {timeGroup.slots.map((slot) => (
                                            <div
                                              key={slot.id}
                                              id={`slot-${slot.id}`}
                                            >
                                              <CoachingSlotCard
                                                slot={slot}
                                                course={mockCourses.find(
                                                  (c) => c.id === slot.courseId
                                                )}
                                                isProfessor={false}
                                                onBook={handleBookSlot}
                                                onCancelBooking={
                                                  handleCancelBooking
                                                }
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
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {activeStudentTab === "available" && (
                    <div className="space-y-6">
                      {availableSlots.length === 0 &&
                      pastSlotsByDay.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                          <p className="text-sm text-zinc-600 mb-1">
                            Für die aktuelle Auswahl wurden keine Coaching-Slots
                            gefunden.
                          </p>
                          <p className="text-xs text-zinc-500">
                            Probiere einen anderen Kurs oder ändere die
                            Suchanfrage.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Upcoming slots */}
                          {availableSlotsByDay.length > 0 &&
                            availableSlotsByDay.map((dayGroup) => (
                              <div key={dayGroup.dayKey} className="space-y-3">
                                <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                                  {dayGroup.dayLabel}
                                </h4>
                                {dayGroup.timeGroups.map((timeGroup) => (
                                  <div
                                    key={timeGroup.timeKey}
                                    className="space-y-2"
                                  >
                                    <h5 className="text-xs font-medium text-zinc-500">
                                      {timeGroup.timeLabel}
                                    </h5>
                                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                                      {timeGroup.slots.map((slot) => (
                                        <div
                                          key={slot.id}
                                          id={`slot-${slot.id}`}
                                        >
                                          <CoachingSlotCard
                                            slot={slot}
                                            course={mockCourses.find(
                                              (c) => c.id === slot.courseId
                                            )}
                                            isProfessor={false}
                                            onBook={handleBookSlot}
                                            onCancelBooking={
                                              handleCancelBooking
                                            }
                                            onDelete={handleDeleteSlot}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}

                          {/* Past slots - collapsible */}
                          {pastSlotsByDay.length > 0 && (
                            <div className="space-y-4">
                              <button
                                onClick={() => setShowPastSlots(!showPastSlots)}
                                className="flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                              >
                                {showPastSlots ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                                <span>
                                  Vergangene Coachings (
                                  {filteredPastSlots.length})
                                </span>
                              </button>
                              {showPastSlots &&
                                pastSlotsByDay.map((dayGroup) => (
                                  <div
                                    key={dayGroup.dayKey}
                                    className="space-y-3 opacity-60"
                                  >
                                    <h4 className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                                      {dayGroup.dayLabel}
                                    </h4>
                                    {dayGroup.timeGroups.map((timeGroup) => (
                                      <div
                                        key={timeGroup.timeKey}
                                        className="space-y-2"
                                      >
                                        <h5 className="text-xs font-medium text-zinc-500">
                                          {timeGroup.timeLabel}
                                        </h5>
                                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                                          {timeGroup.slots.map((slot) => (
                                            <div
                                              key={slot.id}
                                              id={`slot-${slot.id}`}
                                            >
                                              <CoachingSlotCard
                                                slot={slot}
                                                course={mockCourses.find(
                                                  (c) => c.id === slot.courseId
                                                )}
                                                isProfessor={false}
                                                onBook={handleBookSlot}
                                                onCancelBooking={
                                                  handleCancelBooking
                                                }
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
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

function groupSlotsByDay(slots: CoachingSlot[]): DayGroup[] {
  // Group slots by day
  const dayMap = new Map<string, CoachingSlot[]>();
  slots.forEach((slot) => {
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

  return days;
}
