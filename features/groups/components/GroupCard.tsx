import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Users, Search } from "lucide-react";
import type { Course, Group, User } from "@/shared/lib/api-types";
import { Avatar } from "@/shared/components/ui/Avatar";
import { MemberBadge } from "@/features/dashboard/components/MemberBadge";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/Popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/Card";

type GroupCardProps = {
  group: Group;
  course?: Course;
  isUserInGroup?: boolean;
  isGroupFull?: boolean;
  onJoinGroup?: (groupId: number) => void;
  onLeaveGroup?: (groupId: number) => void;
  // Admin props
  isAdmin?: boolean;
  users?: User[];
  onDelete?: (groupId: number) => void;
  onAssignUser?: (groupId: number, userId: number) => void;
  onRemoveUser?: (groupId: number, memberId: number) => void;
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
  const [userSearch, setUserSearch] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFull = group.maxMembers && group.members.length >= group.maxMembers;

  // Focus input when popover opens
  useEffect(() => {
    if (isPopoverOpen && inputRef.current) {
      // Small delay to ensure the popover is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isPopoverOpen]);

  // Reset search when popover closes
  useEffect(() => {
    if (!isPopoverOpen) {
      setUserSearch("");
    }
  }, [isPopoverOpen]);

  // Filter available users
  const availableUsers = users
  .filter((user) => user.role === "student" || user.role === "admin")
  .filter(
    (user) => !group.members.some((m) => m.id === user.id)
  );

  // Filter users by search query
  const filteredUsers = availableUsers.filter((user) => {
    if (!userSearch.trim()) return true;
    const searchLower = userSearch.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.program?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

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
                <>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-0 right-0 !w-7 h-7 !p-0 shrink-0"
                    title="Löschen"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="max-w-sm">
                      <DialogHeader onClose={() => setIsDeleteDialogOpen(false)}>
                        <DialogTitle>Gruppe löschen?</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 px-6 py-2">
                        <p className="text-sm text-zinc-600">
                          Möchten Sie die Gruppe "{group.name}" wirklich löschen?
                        </p>
                        <p className="text-xs text-zinc-500">
                          Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>
                      </div>
                      <div className="flex gap-3 px-6 pb-3 pt-2">
                        <Button
                          variant="secondary"
                          className="flex-1 text-xs"
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          Abbrechen
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 text-xs"
                          onClick={() => {
                            onDelete(group.id);
                            setIsDeleteDialogOpen(false);
                          }}
                        >
                          Löschen
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
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
                  key={member.id}
                  member={member}
                  onRemove={
                    isAdmin && onRemoveUser
                      ? (memberId: number) => setMemberToRemove({ id: memberId, name: member.name })
                      : undefined
                  }
                />
              ))}
              {isAdmin && !isFull && onAssignUser && (
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
                  <PopoverContent 
                    className="w-[calc(100vw-2rem)] sm:w-64 max-w-sm p-0" 
                    align="start"
                  >
                    <div className="p-2 sm:p-2 border-b border-zinc-200">
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder="User suchen..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        icon={Search}
                        className="text-sm sm:text-sm py-2.5 sm:py-2"
                      />
                    </div>
                    <div className="max-h-[50vh] sm:max-h-[200px] overflow-auto space-y-0.5 p-1 sm:p-1">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              onAssignUser(group.id, user.id);
                              setIsPopoverOpen(false);
                            }}
                            className="w-full px-3 sm:px-3 py-3 sm:py-2 text-sm text-left rounded-lg hover:bg-zinc-100 active:bg-zinc-200 transition-colors text-zinc-700 touch-manipulation"
                          >
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-zinc-500">
                              {user.program}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-3 sm:py-2 text-xs text-zinc-500 text-center">
                          {availableUsers.length === 0
                            ? "Keine verfügbaren User"
                            : "Keine Ergebnisse"}
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

      {/* Remove Member Confirmation Dialog */}
      {memberToRemove && onRemoveUser && (
        <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader onClose={() => setMemberToRemove(null)}>
              <DialogTitle>Mitglied entfernen?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 px-6 py-2">
              <p className="text-sm text-zinc-600">
                Möchten Sie "{memberToRemove.name}" wirklich aus der Gruppe entfernen?
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1 text-xs"
                onClick={() => setMemberToRemove(null)}
              >
                Abbrechen
              </Button>
              <Button
                variant="destructive"
                className="flex-1 text-xs"
                onClick={() => {
                  onRemoveUser(group.id, memberToRemove.id);
                  setMemberToRemove(null);
                }}
              >
                Entfernen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
