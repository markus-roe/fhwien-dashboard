"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { type Group } from "@/shared/lib/api-types";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!userLoading && currentUser && !(currentUser.role === "professor" || currentUser.role === "admin")) {
      router.push("/schedule");
    }
  }, [currentUser, userLoading, router]);

  if (userLoading || !currentUser) {
    return <div className="p-4">Laden...</div>;
  }

  const {
    groups: allGroups,
    loading: groupsLoading,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useGroups();
  const { users: allUsers, loading: usersLoading } = useUsers();
  const { courses, loading: coursesLoading } = useCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [groupSearch, setGroupSearch] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  // Filtering logic
  const { filteredGroups: groups } = useDashboardGroupFilters({
    allGroups,
    courses,
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
    groupId: number,
    userId: number
  ) => {
    try {
      await handleAssignUserToGroup(groupId, userId, allGroups, allUsers);
    } catch (error) {
      // Error already logged in hook
    }
  };

  const handleRemoveUserFromGroupWrapper = async (
    groupId: number,
    memberId: number
  ) => {
    try {
      await handleRemoveUserFromGroup(groupId, memberId, allGroups);
    } catch (error) {
      // Error already logged in hook
    }
  };

  const handleCreateGroupWrapper = async (data: CreateGroupFormData) => {
    try {
      const courseId = data.courseId ? parseInt(data.courseId) : selectedCourseId;
      if (!courseId) return;
      await handleCreateGroup({
        courseId,
        name: data.name,
        description: data.description,
        maxMembers: data.maxMembers,
      }, selectedCourseId);
      setIsCreateGroupOpen(false);
    } catch (error) {
      // Error already logged in hook
    }
  };

  const handleDeleteGroupWrapper = async (groupId: number) => {
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
        courses={courses}
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
        courses={courses}
        defaultCourseId={selectedCourseId?.toString() || null}
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
                courses.find((c) => c.id === groupToDelete.courseId)
                  ?.title ?? "Kurs"
              } • ${groupToDelete.members.length} Mitglieder`
            : undefined
        }
      />
    </>
  );
}
