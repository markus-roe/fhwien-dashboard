"use client";

import { useState } from "react";
import { type Group, currentUser } from "@/shared/data/mockData";
import { redirect } from "next/navigation";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useCourses } from "@/shared/hooks/useCourses";
import { useDashboardGroupFilters } from "@/features/dashboard/hooks/useDashboardGroupFilters";
import { useDashboardGroupOperations } from "@/features/dashboard/hooks/useDashboardGroupOperations";
import { GroupsTab } from "@/features/dashboard/components/GroupsTab";
import { CreateGroupDialog } from "@/features/groups/components/CreateGroupDialog";
import type { CreateGroupFormData } from "@/features/groups/types";
import { DeleteConfirmationDialog } from "@/shared/components/ui/DeleteConfirmationDialog";

export default function GroupsPage() {
  if (currentUser.role !== "professor" && currentUser.name !== "Markus") {
    redirect("/schedule");
  }

  const {
    groups: allGroups,
    loading: groupsLoading,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useGroups();
  const { users: allUsers, loading: usersLoading } = useUsers();
  const { courses: mockCourses, loading: coursesLoading } = useCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [groupSearch, setGroupSearch] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  // Filtering logic
  const { filteredGroups: groups } = useDashboardGroupFilters({
    allGroups,
    courses: mockCourses,
    selectedCourseId,
    searchQuery: groupSearch,
  });

  // Operations
  const {
    handleAssignUserToGroup,
    handleRemoveUserFromGroup,
    handleCreateGroup,
    handleDeleteGroup,
  } = useDashboardGroupOperations({
    createGroup,
    updateGroup,
    deleteGroup,
  });

  const handleAssignUserToGroupWrapper = async (
    groupId: string,
    userId: string
  ) => {
    try {
      await handleAssignUserToGroup(groupId, userId, allGroups, allUsers);
    } catch (error) {
      // Error already logged in hook
    }
  };

  const handleRemoveUserFromGroupWrapper = async (
    groupId: string,
    member: string
  ) => {
    try {
      await handleRemoveUserFromGroup(groupId, member, allGroups);
    } catch (error) {
      // Error already logged in hook
    }
  };

  const handleCreateGroupWrapper = async (data: CreateGroupFormData) => {
    try {
      await handleCreateGroup(data, selectedCourseId);
      setIsCreateGroupOpen(false);
    } catch (error) {
      // Error already logged in hook
    }
  };

  const handleDeleteGroupWrapper = async (groupId: string) => {
    try {
      await handleDeleteGroup(groupId);
      setGroupToDelete(null);
    } catch (error) {
      // Error already logged in hook
    }
  };

  return (
    <>
      <GroupsTab
        groups={groups}
        courses={mockCourses}
        users={allUsers}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
        onDelete={(groupId) => {
          const group = allGroups.find((g) => g.id === groupId);
          if (group) {
            setGroupToDelete(group);
          }
        }}
        onAssignUser={handleAssignUserToGroupWrapper}
        onRemoveUser={handleRemoveUserFromGroupWrapper}
        onCreate={() => setIsCreateGroupOpen(true)}
        search={groupSearch}
        onSearchChange={setGroupSearch}
        loading={groupsLoading || coursesLoading || usersLoading}
      />

      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        courses={mockCourses}
        defaultCourseId={selectedCourseId}
        onSubmit={handleCreateGroupWrapper}
      />

      <DeleteConfirmationDialog
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => {
          if (groupToDelete) {
            handleDeleteGroupWrapper(groupToDelete.id);
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
