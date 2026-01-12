import { useCallback } from "react";
import type { CreateGroupRequest, Group, UpdateGroupRequest, User } from "@/shared/lib/api-types";
import type { CreateGroupFormData } from "@/features/groups/types";

type UseDashboardGroupOperationsProps = {
  createGroup: (data: CreateGroupRequest) => Promise<Group>;
  updateGroup: (
    id: number,
    data: UpdateGroupRequest
  ) => Promise<Group>;
  deleteGroup: (id: number) => Promise<void>;
};

export function useDashboardGroupOperations({
  createGroup,
  updateGroup,
  deleteGroup,
}: UseDashboardGroupOperationsProps) {
  const handleAssignUserToGroup = useCallback(
    async (
      groupId: number,
      userId: number,
      allGroups: Group[],
      allUsers: User[]
    ) => {
      if (!groupId || !userId) return;

      try {
        const group = allGroups.find((g) => g.id === groupId);
        const user = allUsers.find((u) => u.id === userId);
        if (!group || !user) return;

        const isAlreadyMember = group.members.some((m) => m.id === userId);
        const isFull =
          group.maxMembers && group.members.length >= group.maxMembers;
        if (isAlreadyMember || isFull) return;

        await updateGroup(groupId, {
          members: [...group.members.map((m) => m.id), userId],
        });
      } catch (error) {
        console.error("Failed to assign user to group:", error);
        throw error;
      }
    },
    [updateGroup]
  );

  const handleRemoveUserFromGroup = useCallback(
    async (groupId: number, memberId: number, allGroups: Group[]) => {
      try {
        const group = allGroups.find((g) => g.id === groupId);
        if (!group) return;

        await updateGroup(groupId, {
          members: group.members.filter((m) => m.id !== memberId).map((m) => m.id),
        });
      } catch (error) {
        console.error("Failed to remove user from group:", error);
        throw error;
      }
    },
    [updateGroup]
  );

  const handleCreateGroup = useCallback(
    async (data: CreateGroupRequest, selectedCourseId: number | null) => {
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
    async (groupId: number) => {
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
