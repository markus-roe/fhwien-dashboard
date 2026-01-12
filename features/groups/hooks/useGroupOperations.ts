import { useCallback } from "react";
import type { Group, User } from "@/shared/lib/api-types";

type UseGroupOperationsProps = {
  createGroup: (data: {
    courseId: number;
    name: string;
    description?: string;
    maxMembers?: number;
  }) => Promise<Group>;
  joinGroup: (groupId: number, userId: number) => Promise<Group>;
  leaveGroup: (groupId: number, userId: number) => Promise<Group>;
  currentUser?: User;
};

export function useGroupOperations({
  createGroup,
  joinGroup,
  leaveGroup,
  currentUser,
}: UseGroupOperationsProps) {
  const handleCreateGroup = useCallback(
    async (data: {
      courseId?: number;
      name: string;
      description?: string;
      maxMembers?: number;
    }) => {
      if (!data.courseId || !data.name.trim()) return;

      try {
        await createGroup({
          courseId: data.courseId || 0,
          name: data.name,
          description: data.description,
          maxMembers: data.maxMembers,
        });
      } catch (error) {
        console.error("Failed to create group:", error);
      }
    },
    [createGroup]
  );

  const handleJoinGroup = useCallback(
    async (groupId: number) => {
      if (!currentUser) return;
      try {
        await joinGroup(groupId, currentUser.id);
      } catch (error) {
        console.error("Failed to join group:", error);
        throw error;
      }
    },
    [joinGroup, currentUser]
  );

  const handleLeaveGroup = useCallback(
    async (groupId: number) => {
      if (!currentUser) return;
      try {
        await leaveGroup(groupId, currentUser.id);
      } catch (error) {
        console.error("Failed to leave group:", error);
        throw error;
      }
    },
    [leaveGroup, currentUser]
  );

  const isUserInGroup = useCallback(
    (group: Group) => {
      if (!currentUser) return false;
      return group.members.some((m) => m.id === currentUser.id);
    },
    [currentUser]
  );

  const isGroupFull = useCallback((group: Group) => {
    return group.maxMembers ? group.members.length >= group.maxMembers : false;
  }, []);

  return {
    handleCreateGroup,
    handleJoinGroup,
    handleLeaveGroup,
    isUserInGroup,
    isGroupFull,
  };
}
