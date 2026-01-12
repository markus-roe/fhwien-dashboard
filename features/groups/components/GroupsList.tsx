import type { Group, Course } from "@/shared/lib/api-types";
import { GroupCard } from "./GroupCard";

type GroupsListProps = {
  groups: Group[];
  courses: Course[];
  isUserInGroup: (group: Group) => boolean;
  isGroupFull: (group: Group) => boolean;
  onJoinGroup: (groupId: number) => void;
  onLeaveGroup: (groupId: number) => void;
};

export function GroupsList({
  groups,
  courses,
  isUserInGroup,
  isGroupFull,
  onJoinGroup,
  onLeaveGroup,
}: GroupsListProps) {
  if (groups.length === 0) {
    return null;
  }

  // Group groups by courseId
  const groupsByCourse = groups.reduce((acc, group) => {
    if (!acc[group.courseId]) {
      acc[group.courseId] = [];
    }
    acc[group.courseId].push(group);
    return acc;
  }, {} as Record<string, Group[]>);

  const courseIdsWithGroups = courses
    .map((course) => course.id)
    .filter(
      (courseId) =>
        groupsByCourse[courseId] && groupsByCourse[courseId].length > 0
    );

  return (
    <div className="w-full">
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
                {courseGroups.map((group) => {
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
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
