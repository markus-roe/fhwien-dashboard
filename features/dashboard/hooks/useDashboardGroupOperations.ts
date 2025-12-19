import { useCallback } from "react";
import type { Group, User } from "@/shared/data/mockData";
import type { CreateGroupFormData } from "@/features/groups/types";

type UseDashboardGroupOperationsProps = {
  createGroup: (data: {
    courseId: string;
    name: string;
    description?: string;
    maxMembers?: number;
  }) => Promise<Group>;
  updateGroup: (
    id: string,
    data: {
      members?: string[];
      name?: string;
      description?: string;
      maxMembers?: number;
    }
  ) => Promise<Group>;
  deleteGroup: (id: string) => Promise<void>;
};

export function useDashboardGroupOperations({
  createGroup,
  updateGroup,
  deleteGroup,
}: UseDashboardGroupOperationsProps) {
  const handleAssignUserToGroup = useCallback(
    async (
      groupId: string,
      userId: string,
      allGroups: Group[],
      allUsers: User[]
    ) => {
      if (!groupId || !userId) return;

      try {
        const group = allGroups.find((g) => g.id === groupId);
        const user = allUsers.find((u) => u.id === userId);
        if (!group || !user) return;

        const isAlreadyMember = group.members.includes(user.name);
        const isFull =
          group.maxMembers && group.members.length >= group.maxMembers;
        if (isAlreadyMember || isFull) return;

        await updateGroup(groupId, {
          members: [...group.members, user.name],
        });
      } catch (error) {
        console.error("Failed to assign user to group:", error);
        throw error;
      }
    },
    [updateGroup]
  );

  const handleRemoveUserFromGroup = useCallback(
    async (groupId: string, member: string, allGroups: Group[]) => {
      try {
        const group = allGroups.find((g) => g.id === groupId);
        if (!group) return;

        await updateGroup(groupId, {
          members: group.members.filter((existing) => existing !== member),
        });
      } catch (error) {
        console.error("Failed to remove user from group:", error);
        throw error;
      }
    },
    [updateGroup]
  );

  const handleCreateGroup = useCallback(
    async (data: CreateGroupFormData, selectedCourseId: string | null) => {
      const courseId = data.courseId || selectedCourseId;
      if (!courseId || !data.name.trim()) return;

      try {
        await createGroup({
          courseId,
          name: data.name,
          description: data.description,
          maxMembers: data.maxMembers,
        });
      } catch (error) {
        console.error("Failed to create group:", error);
        throw error;
      }
    },
    [createGroup]
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      try {
        await deleteGroup(groupId);
      } catch (error) {
        console.error("Failed to delete group:", error);
        throw error;
      }
    },
    [deleteGroup]
  );

  return {
    handleAssignUserToGroup,
    handleRemoveUserFromGroup,
    handleCreateGroup,
    handleDeleteGroup,
  };
}
