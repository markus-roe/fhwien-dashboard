import { Plus, Trash2, Users } from "lucide-react";
import type { Course, Group, User } from "@/shared/data/mockData";
import { Avatar } from "@/shared/components/ui/Avatar";
import { MemberBadge } from "@/features/dashboard/components/MemberBadge";
import { Button } from "@/shared/components/ui/Button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/Popover";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/Card";

type GroupCardProps = {
  group: Group;
  course?: Course;
  isUserInGroup?: boolean;
  isGroupFull?: boolean;
  onJoinGroup?: (groupId: string) => void;
  onLeaveGroup?: (groupId: string) => void;
  // Admin props
  isAdmin?: boolean;
  users?: User[];
  onDelete?: (groupId: string) => void;
  onAssignUser?: (groupId: string, userId: string) => void;
  onRemoveUser?: (groupId: string, member: string) => void;
};

export function GroupCard({
  group,
  course,
  isUserInGroup = false,
  isGroupFull = false,
  onJoinGroup,
  onLeaveGroup,
  isAdmin = false,
  users = [],
  onDelete,
  onAssignUser,
  onRemoveUser,
}: GroupCardProps) {
  const isFull = group.maxMembers && group.members.length >= group.maxMembers;

  return (
    <Card className="hover:border-zinc-300 hover:shadow-sm transition-all group max-w-2xl relative">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-1.5 relative pr-8">
              <h3 className="text-sm sm:text-md font-semibold text-zinc-900 group-hover:text-[var(--primary)] transition-colors mb-0.5">
                {group.name}
              </h3>
              {course && (
                <span className="text-xs text-zinc-400">{course.title}</span>
              )}
              {isAdmin && onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-0 right-0 !w-7 h-7 !p-0 shrink-0"
                  onClick={() => onDelete(group.id)}
                  title="Löschen"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-500 mb-2">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {group.members.length}
                {group.maxMembers ? `/${group.maxMembers}` : ""}
              </span>
              {isFull && (
                <span className="text-amber-600 font-medium">Gruppe voll</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {group.members.length === 0 && (
                <span className="text-xs text-zinc-500">
                  Noch keine Mitglieder
                </span>
              )}
              {group.members.map((member) => (
                <MemberBadge
                  key={member}
                  member={member}
                  onRemove={
                    isAdmin && onRemoveUser
                      ? (member) => onRemoveUser(group.id, member)
                      : undefined
                  }
                />
              ))}
              {isAdmin && !isFull && onAssignUser && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="xs"
                      variant="secondary"
                      className="h-6 sm:h-6 px-1.5 sm:px-2 text-xs shrink-0"
                      icon={Plus}
                      iconPosition="left"
                    >
                      <span className="hidden sm:inline">
                        Student hinzufügen
                      </span>
                      <span className="sm:hidden">Hinzufügen</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-1" align="start">
                    <div className="max-h-[200px] overflow-auto space-y-0.5">
                      {users
                        .filter((user) => !group.members.includes(user.name))
                        .map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              onAssignUser(group.id, user.id);
                            }}
                            className="w-full px-3 py-2 text-sm text-left rounded-lg hover:bg-zinc-100 transition-colors text-zinc-700"
                          >
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-zinc-500">
                              {user.program}
                            </div>
                          </button>
                        ))}
                      {users.filter(
                        (user) => !group.members.includes(user.name)
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
          {!isAdmin && (
            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              {!isUserInGroup && !isGroupFull && onJoinGroup && (
                <Button
                  onClick={() => onJoinGroup(group.id)}
                  variant="primary"
                  className="text-xs h-7 px-2.5 flex-1 sm:flex-none"
                >
                  Beitreten
                </Button>
              )}
              {isUserInGroup && onLeaveGroup && (
                <Button
                  onClick={() => onLeaveGroup(group.id)}
                  variant="destructive"
                  className="text-xs h-7 px-2.5 flex-1 sm:flex-none"
                >
                  Verlassen
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
