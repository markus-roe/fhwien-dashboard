"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CourseSelector } from "./CourseSelector";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
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
      <div className="grid gap-3 md:grid-cols-[minmax(0,280px),minmax(0,1fr)]">
        <CourseSelector
          courses={courses}
          selectedCourseId={selectedCourseId}
          onCourseChange={onCourseChange}
        />
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Gruppen suchen
          </label>
          <Input
            type="text"
            placeholder="Gruppenname, Mitglieder oder Fach durchsuchen..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

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
            onClick={onCreate}
          >
            Neue Gruppe
          </Button>
        </div>

        {groups.length === 0 ? (
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
                    <div className="space-y-3">
                      {courseGroupsList.map((group) => {
                        const isFull =
                          group.maxMembers &&
                          group.members.length >= group.maxMembers;

                        return (
                          <div
                            key={group.id}
                            className="group rounded-lg border border-zinc-100 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] max-w-2xl"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-zinc-900">
                                  {group.name}
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
                                  onClick={() => onDelete(group.id)}
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
                                      onRemoveUser(group.id, member)
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
                                            !group.members.includes(user.name)
                                        )
                                        .map((user) => (
                                          <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => {
                                              onAssignUser(group.id, user.id);
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
