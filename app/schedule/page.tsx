"use client";

import { useState, useMemo, useEffect } from "react";
import { SessionPanel } from "@/components/schedule/SessionPanel";
import { useSessionPanel } from "@/components/schedule/hooks/useSessionPanel";
import { CalendarView } from "@/components/schedule/CalendarView";
import { Sidebar } from "@/components/layout/Sidebar";
import { currentUser } from "@/data/mockData";
import { useCourses } from "@/hooks/useCourses";

const STORAGE_KEY = "schedule-visible-course-ids";

export default function SchedulePage() {
  const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
    useSessionPanel();

  const { courses: mockCourses, loading: coursesLoading } = useCourses();

  // Get all course IDs for current user's program
  const allCourseIds = useMemo(() => {
    return mockCourses
      .filter((course) => course.program.includes(currentUser.program))
      .map((course) => course.id);
  }, [mockCourses]);

  // Initialize visibleCourseIds from localStorage or default to all courses
  const [visibleCourseIds, setVisibleCourseIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return new Set(parsed);
      }
    } catch (error) {
      console.error(
        "Failed to load visible course IDs from localStorage:",
        error
      );
    }

    return new Set();
  });

  // Update visibleCourseIds when courses are loaded
  useEffect(() => {
    if (allCourseIds.length > 0 && !coursesLoading) {
      setVisibleCourseIds((prev) => {
        // If visibleCourseIds is empty, initialize with all course IDs
        if (prev.size === 0) {
          const newSet = new Set(allCourseIds);
          // Save to localStorage
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(Array.from(newSet))
            );
          } catch (error) {
            console.error(
              "Failed to save visible course IDs to localStorage:",
              error
            );
          }
          return newSet;
        } else {
          // Merge with new course IDs (in case new courses were added)
          const newSet = new Set(prev);
          let hasChanges = false;
          allCourseIds.forEach((id) => {
            if (!newSet.has(id)) {
              newSet.add(id);
              hasChanges = true;
            }
          });
          // Remove course IDs that no longer exist
          Array.from(newSet).forEach((id) => {
            if (!allCourseIds.includes(id)) {
              newSet.delete(id);
              hasChanges = true;
            }
          });
          if (hasChanges) {
            try {
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(Array.from(newSet))
              );
            } catch (error) {
              console.error(
                "Failed to save visible course IDs to localStorage:",
                error
              );
            }
            return newSet;
          }
          return prev;
        }
      });
    }
  }, [allCourseIds, coursesLoading]);

  const handleCourseVisibilityChange = (courseId: string, visible: boolean) => {
    setVisibleCourseIds((prev) => {
      const next = new Set(prev);
      if (visible) {
        next.add(courseId);
      } else {
        next.delete(courseId);
      }
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (error) {
        console.error(
          "Failed to save visible course IDs to localStorage:",
          error
        );
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
          <Sidebar
            showCalendar={true}
            showNextUpCard={false}
            emptyMessage="Keine anstehenden Termine."
            onSessionClick={openSessionPanel}
            visibleCourseIds={visibleCourseIds}
            onCourseVisibilityChange={handleCourseVisibilityChange}
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="h-full flex flex-col min-h-0">
            <CalendarView
              onSessionClick={openSessionPanel}
              visibleCourseIds={visibleCourseIds}
            />
          </div>
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
