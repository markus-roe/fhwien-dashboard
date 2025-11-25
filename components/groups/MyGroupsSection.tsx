import { UserCheck } from "lucide-react";
import type { Course, Group } from "@/data/mockData";
import { GroupCard } from "@/components/groups/GroupCard";

type MyGroupsSectionProps = {
  myGroups: Group[];
  courses: Course[];
  isUserInGroup: (group: Group) => boolean;
  isGroupFull: (group: Group) => boolean;
  onJoinGroup: (groupId: string) => void;
  onLeaveGroup: (groupId: string) => void;
};

export function MyGroupsSection({
  myGroups,
  courses,
  isUserInGroup,
  isGroupFull,
  onJoinGroup,
  onLeaveGroup,
}: MyGroupsSectionProps) {
  if (myGroups.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--primary)]/10">
          <UserCheck className="w-4 h-4 text-[var(--primary)]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-900">
            Meine Gruppen
          </h3>
          <p className="text-xs text-zinc-500">
            {myGroups.length} {myGroups.length === 1 ? "Gruppe" : "Gruppen"}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {myGroups.map((group) => {
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
        })}
      </div>
    </div>
  );
}
