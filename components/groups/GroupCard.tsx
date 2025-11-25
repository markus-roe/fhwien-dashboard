import { Users } from "lucide-react";
import type { Course, Group } from "@/data/mockData";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type GroupCardProps = {
  group: Group;
  course?: Course;
  isUserInGroup: boolean;
  isGroupFull: boolean;
  onJoinGroup: (groupId: string) => void;
  onLeaveGroup: (groupId: string) => void;
};

export function GroupCard({
  group,
  course,
  isUserInGroup,
  isGroupFull,
  onJoinGroup,
  onLeaveGroup,
}: GroupCardProps) {
  return (
    <Card className="hover:border-zinc-300 hover:shadow-sm transition-all group">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-1.5">
              <h3 className="text-md font-semibold text-zinc-900 group-hover:text-[var(--primary)] transition-colors mb-0.5">
                {group.name}
              </h3>
              {course && (
                <span className="text-xs text-zinc-400">{course.title}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {group.members.length}
                {group.maxMembers ? `/${group.maxMembers}` : ""}
              </span>
            </div>
            {group.members.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {group.members.map((member) => (
                  <Badge
                    rounded="md"
                    key={member}
                    variant="default"
                    size="sm"
                    className="normal-case font-normal"
                  >
                    {member}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {!isUserInGroup && !isGroupFull && (
              <Button
                onClick={() => onJoinGroup(group.id)}
                variant="primary"
                className="text-xs h-7 px-2.5"
              >
                Beitreten
              </Button>
            )}
            {isUserInGroup && (
              <Button
                onClick={() => onLeaveGroup(group.id)}
                variant="destructive"
                className="text-xs h-7 px-2.5"
              >
                Verlassen
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
