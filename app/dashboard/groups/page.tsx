"use client";

import { useMemo, useState } from "react";
import { type Group, currentUser } from "@/data/mockData";
import { redirect } from "next/navigation";
import { useGroups } from "@/hooks/useGroups";
import { useUsers } from "@/hooks/useUsers";
import { useCourses } from "@/hooks/useCourses";
import { GroupsTab } from "@/components/dashboard/GroupsTab";
import {
  CreateGroupDialog,
  type CreateGroupFormData,
} from "@/components/groups/CreateGroupDialog";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";

export default function GroupsPage() {
  if (currentUser.role !== "professor" && currentUser.name !== "Markus") {
    redirect("/schedule");
  }

  const {
    groups: allGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useGroups();
  const { users: allUsers } = useUsers();
  const { courses: mockCourses } = useCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [groupSearch, setGroupSearch] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const groups = useMemo(() => {
    let filtered = allGroups;

    if (selectedCourseId) {
      filtered = filtered.filter(
        (group) => group.courseId === selectedCourseId
      );
    }

    if (groupSearch.trim()) {
      const query = groupSearch.toLowerCase();
      filtered = filtered.filter((group) => {
        const course = mockCourses.find((c) => c.id === group.courseId);
        return (
          group.name.toLowerCase().includes(query) ||
          group.description?.toLowerCase().includes(query) ||
          course?.title.toLowerCase().includes(query) ||
          group.members.some((m) => m.toLowerCase().includes(query)) ||
          false
        );
      });
    }

    return filtered;
  }, [allGroups, selectedCourseId, groupSearch, mockCourses]);

  const users = useMemo(() => {
    return allUsers;
  }, [allUsers]);

  const handleAssignUserToGroup = async (groupId: string, userId: string) => {
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
    }
  };

  const handleRemoveUserFromGroup = async (groupId: string, member: string) => {
    try {
      const group = allGroups.find((g) => g.id === groupId);
      if (!group) return;

      await updateGroup(groupId, {
        members: group.members.filter((existing) => existing !== member),
      });
    } catch (error) {
      console.error("Failed to remove user from group:", error);
    }
  };

  const handleCreateGroup = async (data: CreateGroupFormData) => {
    const courseId = data.courseId || selectedCourseId;
    if (!courseId || !data.name.trim()) return;

    try {
      await createGroup({
        courseId,
        name: data.name,
        description: data.description,
        maxMembers: data.maxMembers,
      });
      setIsCreateGroupOpen(false);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId);
      setGroupToDelete(null);
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  return (
    <>
      <GroupsTab
        groups={groups}
        courses={mockCourses}
        users={users}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
        onDelete={(groupId) => {
          const group = allGroups.find((g) => g.id === groupId);
          if (group) {
            setGroupToDelete(group);
          }
        }}
        onAssignUser={handleAssignUserToGroup}
        onRemoveUser={handleRemoveUserFromGroup}
        onCreate={() => setIsCreateGroupOpen(true)}
        search={groupSearch}
        onSearchChange={setGroupSearch}
      />

      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        courses={mockCourses}
        defaultCourseId={selectedCourseId}
        onSubmit={handleCreateGroup}
      />

      <DeleteConfirmationDialog
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => {
          if (groupToDelete) {
            handleDeleteGroup(groupToDelete.id);
          }
        }}
        title="Gruppe löschen?"
        description="Möchten Sie die folgende Gruppe wirklich löschen?"
        itemName={groupToDelete?.name}
        itemDetails={
          groupToDelete
            ? `${
                mockCourses.find((c) => c.id === groupToDelete.courseId)
                  ?.title ?? "Kurs"
              } • ${groupToDelete.members.length} Mitglieder`
            : undefined
        }
      />
    </>
  );
}
