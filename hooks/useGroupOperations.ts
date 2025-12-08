import { useCallback } from "react";
import type { Group } from "@/data/mockData";
import { currentUser } from "@/data/mockData";

type UseGroupOperationsProps = {
  createGroup: (data: {
    courseId: string;
    name: string;
    description?: string;
    maxMembers?: number;
  }) => Promise<Group>;
  joinGroup: (groupId: string) => Promise<Group>;
  leaveGroup: (groupId: string) => Promise<Group>;
};

export function useGroupOperations({
  createGroup,
  joinGroup,
  leaveGroup,
}: UseGroupOperationsProps) {
  const handleCreateGroup = useCallback(
    async (data: {
      courseId?: string;
      name: string;
      description?: string;
      maxMembers?: number;
    }) => {
      if (!data.courseId || !data.name.trim()) return;

      try {
        await createGroup({
          courseId: data.courseId,
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
    async (groupId: string) => {
      try {
        await joinGroup(groupId);
      } catch (error) {
        console.error("Failed to join group:", error);
        throw error;
      }
    },
    [joinGroup]
  );

  const handleLeaveGroup = useCallback(
    async (groupId: string) => {
      try {
        await leaveGroup(groupId);
      } catch (error) {
        console.error("Failed to leave group:", error);
        throw error;
      }
    },
    [leaveGroup]
  );

  const isUserInGroup = useCallback((group: Group) => {
    return group.members.some((m) => m === currentUser.name);
  }, []);

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
