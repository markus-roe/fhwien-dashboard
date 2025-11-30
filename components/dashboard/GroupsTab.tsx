"use client";

import { Plus } from "lucide-react";
import { CourseSelector } from "./CourseSelector";
import { TabFilters } from "./TabFilters";
import { TabHeader } from "./TabHeader";
import { GroupCard } from "@/components/groups/GroupCard";
import {
  LoadingSkeleton,
  LoadingSkeletonGroupCard,
} from "@/components/ui/LoadingSkeleton";
import type { Group, Course, User } from "@/data/mockData";

type GroupsTabProps = {
  groups: Group[];
  courses: Course[];
  users: User[];
  selectedCourseId: string | null;
  onCourseChange: (courseId: string | null) => void;
  onDelete: (groupId: string) => void;
  onAssignUser: (groupId: string, userId: string) => void;
  onRemoveUser: (groupId: string, member: string) => void;
  onCreate: () => void;
  search: string;
  onSearchChange: (search: string) => void;
  loading?: boolean;
};

export function GroupsTab({
  groups,
  courses,
  users,
  selectedCourseId,
  onCourseChange,
  onDelete,
  onAssignUser,
  onRemoveUser,
  onCreate,
  search,
  onSearchChange,
  loading = false,
}: GroupsTabProps) {
  // Group groups by courseId
  const groupsByCourse = groups.reduce((acc, group) => {
    if (!acc[group.courseId]) {
      acc[group.courseId] = [];
    }
    acc[group.courseId].push(group);
    return acc;
  }, {} as Record<string, Group[]>);

  // Get course IDs in the same order as the courses array
  const courseIdsWithGroups = courses
    .map((course) => course.id)
    .filter(
      (courseId) =>
        groupsByCourse[courseId] && groupsByCourse[courseId].length > 0
    );

  return (
    <div className="space-y-5">
      <TabFilters
        leftFilter={
          <CourseSelector
            courses={courses}
            selectedCourseId={selectedCourseId}
            onCourseChange={onCourseChange}
          />
        }
        searchLabel="Gruppen suchen"
        searchPlaceholder="Gruppenname, Mitglieder oder Fach durchsuchen..."
        searchValue={search}
        onSearchChange={onSearchChange}
      />

      <div className="space-y-3">
        <TabHeader
          title="Gruppenübersicht"
          buttonLabel="Neue Gruppe"
          buttonIcon={Plus}
          onButtonClick={onCreate}
        />

        {loading ? (
          <div className="w-full">
            <div className="space-y-4">
              {[...Array(2)].map((_, courseIndex) => (
                <div key={courseIndex}>
                  {courseIndex > 0 && (
                    <div className="border-t border-zinc-100 mb-4" />
                  )}
                  <div className="mb-2.5">
                    <LoadingSkeleton height="0.75rem" width="5rem" />
                  </div>
                  <div className="space-y-2.5">
                    {[...Array(2)].map((_, i) => (
                      <LoadingSkeletonGroupCard key={i} isAdmin={true} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : groups.length === 0 ? (
          <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-center text-xs text-zinc-500 bg-zinc-50/60">
            Für dieses Fach sind noch keine Gruppen angelegt.
          </div>
        ) : (
          <div className="w-full">
            <div className="space-y-4">
              {courseIdsWithGroups.map((courseId, courseIndex) => {
                const course = courses.find((c) => c.id === courseId);
                const courseGroupsList = groupsByCourse[courseId];

                return (
                  <div key={courseId}>
                    {courseIndex > 0 && (
                      <div className="border-t border-zinc-100 mb-4" />
                    )}
                    <div className="mb-2.5">
                      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                        {course?.title || "Unbekannter Kurs"}
                      </h4>
                    </div>
                    <div className="space-y-2.5">
                      {courseGroupsList.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          course={course}
                          isAdmin={true}
                          users={users}
                          onDelete={onDelete}
                          onAssignUser={onAssignUser}
                          onRemoveUser={onRemoveUser}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
