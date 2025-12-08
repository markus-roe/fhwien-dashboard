"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/Card";
import type { Session, LocationType } from "@/shared/data/mockData";
import { useCoachingSlots } from "@/features/coaching/hooks/useCoachingSlots";
import { useCourses } from "@/shared/hooks/useCourses";
import { useCoachingSlotFilters } from "@/features/coaching/hooks/useCoachingSlotFilters";
import { useCoachingSlotOperations } from "@/features/coaching/hooks/useCoachingSlotOperations";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { useSessionPanel } from "@/features/schedule/components/hooks/useSessionPanel";
import { SessionPanel } from "@/features/schedule/components/SessionPanel";
import { SegmentedTabs } from "@/shared/components/ui/SegmentedTabs";
import { CourseFilterButtons } from "@/features/groups/components/CourseFilterButtons";
import { Input } from "@/shared/components/ui/Input";
import { CoachingSlotsList } from "@/features/coaching/components/CoachingSlotsList";
import { LoadingSkeletonCoachingCards } from "@/shared/components/ui/LoadingSkeleton";

export default function CoachingPage() {
  const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
    useSessionPanel();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeStudentTab, setActiveStudentTab] = useState<
    "myBookings" | "available"
  >("available");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPastSlots, setShowPastSlots] = useState(false);

  // Always fetch all slots, filter client-side
  const {
    slots: allSlots,
    loading: slotsLoading,
    bookSlot,
    cancelBooking,
    deleteSlot,
  } = useCoachingSlots();

  const { courses: mockCourses, loading: coursesLoading } = useCourses();
  const isLoading = slotsLoading || coursesLoading;

  // Filtering logic
  const {
    totalSlotCount,
    courseSlotCounts,
    filteredUpcomingSlots,
    filteredPastSlots,
    myUpcomingSlots,
    myPastSlots,
    availableSlots,
    totalMyBookingsCount,
  } = useCoachingSlotFilters({
    allSlots,
    courses: mockCourses,
    selectedCourseId,
    searchQuery,
  });

  // Slot operations
  const { handleBookSlot, handleCancelBooking, handleDeleteSlot } =
    useCoachingSlotOperations({
      bookSlot,
      cancelBooking,
      deleteSlot,
    });

  // Update slots reference for compatibility with existing code
  const slots = allSlots.filter((slot) =>
    selectedCourseId ? slot.courseId === selectedCourseId : true
  );

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
                    loading: isLoading,
                  },
                  {
                    value: "myBookings",
                    label: "Meine Buchungen",
                    badge:
                      totalMyBookingsCount > 0
                        ? totalMyBookingsCount
                        : undefined,
                    loading: isLoading,
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
                    loading={isLoading}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {activeStudentTab === "myBookings" && (
                    <CoachingSlotsList
                      upcomingSlots={myUpcomingSlots}
                      pastSlots={myPastSlots}
                      courses={mockCourses}
                      onBook={handleBookSlot}
                      onCancelBooking={handleCancelBooking}
                      onDelete={handleDeleteSlot}
                      showPastSlots={showPastSlots}
                      onTogglePastSlots={() => setShowPastSlots(!showPastSlots)}
                      pastSlotsLabel="Vergangene Buchungen"
                      emptyMessage={{
                        title:
                          "Du hast aktuell keine gebuchten Coaching-Slots.",
                        description: `Wechsle zur Ansicht "Alle Coachings" um einen Termin zu buchen.`,
                      }}
                    />
                  )}

                  {activeStudentTab === "available" && (
                    <div className="space-y-6">
                      {isLoading ? (
                        <LoadingSkeletonCoachingCards />
                      ) : (
                        <CoachingSlotsList
                          upcomingSlots={availableSlots}
                          pastSlots={filteredPastSlots}
                          courses={mockCourses}
                          onBook={handleBookSlot}
                          onCancelBooking={handleCancelBooking}
                          onDelete={handleDeleteSlot}
                          showPastSlots={showPastSlots}
                          onTogglePastSlots={() =>
                            setShowPastSlots(!showPastSlots)
                          }
                          emptyMessage={{
                            title:
                              "Für die aktuelle Auswahl wurden keine Coaching-Slots gefunden.",
                            description:
                              "Probiere einen anderen Kurs oder ändere die Suchanfrage.",
                          }}
                        />
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
