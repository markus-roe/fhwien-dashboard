import { Search, Users } from "lucide-react";
import type { Course, Group } from "@/data/mockData";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { GroupCard } from "@/components/groups/GroupCard";
import { CourseFilterButtons } from "@/components/groups/CourseFilterButtons";
import { Input } from "../ui/Input";

type GroupSearchSectionProps = {
  courseGroups: Group[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateGroupClick: () => void;
  courses: Course[];
  isUserInGroup: (group: Group) => boolean;
  isGroupFull: (group: Group) => boolean;
  onJoinGroup: (groupId: string) => void;
  onLeaveGroup: (groupId: string) => void;
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string | null) => void;
  totalGroupCount: number;
  courseGroupCounts: Record<string, number>;
};

export function GroupSearchSection({
  courseGroups,
  searchQuery,
  onSearchChange,
  onCreateGroupClick,
  courses,
  isUserInGroup,
  isGroupFull,
  onJoinGroup,
  onLeaveGroup,
  selectedCourseId,
  onSelectCourse,
  totalGroupCount,
  courseGroupCounts,
}: GroupSearchSectionProps) {

  // Group groups by courseId
  const groupsByCourse = courseGroups.reduce((acc, group) => {
    if (!acc[group.courseId]) {
      acc[group.courseId] = [];
    }
    acc[group.courseId].push(group);
    return acc;
  }, {} as Record<string, Group[]>);

  // Get course IDs in the same order as the filter buttons (courses array order)
  const courseIdsWithGroups = courses
    .map((course) => course.id)
    .filter((courseId) => groupsByCourse[courseId] && groupsByCourse[courseId].length > 0);

  const renderGroupCard = (group: Group) => {
    const course = courses.find((c) => c.id === group.courseId);
    const userInGroup = isUserInGroup(group);
    const full = isGroupFull(group);

    return (
      <GroupCard
        key={group.id}
        group={group}
        course={course}
        isUserInGroup={userInGroup}
        isGroupFull={full}
        onJoinGroup={onJoinGroup}
        onLeaveGroup={onLeaveGroup}
      />
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 relative">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-zinc-600 uppercase tracking-wide">
                Alle Gruppen
              </h3>
            </div>
            <Input
              type="text"
              placeholder="Gruppen durchsuchen..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Button onClick={onCreateGroupClick} iconPosition="left">
            <span className="hidden sm:inline">Neue Gruppe</span>
            <span className="sm:hidden">Neu</span>
          </Button>
        </div>

        <CourseFilterButtons
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourse={onSelectCourse}
          totalGroupCount={totalGroupCount}
          courseGroupCounts={courseGroupCounts}
        />

        {/* Alle Gruppen - gefiltert/gesucht */}
        {courseGroups.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <p className="text-xs sm:text-sm text-zinc-500 mb-4">
                {searchQuery
                  ? "Keine Gruppen gefunden."
                  : selectedCourseId
                    ? "Noch keine Gruppen für dieses Fach vorhanden."
                    : "Noch keine Gruppen vorhanden."}
              </p>
              <Button onClick={onCreateGroupClick} variant="secondary" className="text-xs">
                Erste Gruppe erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {courseIdsWithGroups.map((courseId, courseIndex) => {
              const course = courses.find((c) => c.id === courseId);
              const courseGroups = groupsByCourse[courseId];

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
                    {courseGroups.map(renderGroupCard)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

