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
      <div className="mb-3">
        <h3 className="text-sm font-medium text-zinc-600 uppercase tracking-wide">
          Meine Gruppen
        </h3>
      </div>
      <div className="space-y-2.5">
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

