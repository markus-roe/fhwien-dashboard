"use client";

import { useState } from "react";
import { type User, type Program, currentUser } from "@/shared/data/mockData";
import { redirect } from "next/navigation";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useDashboardUserFilters } from "@/features/users/hooks/useDashboardUserFilters";
import { useDashboardUserOperations } from "@/features/users/hooks/useDashboardUserOperations";
import { UsersTab } from "@/features/dashboard/components/UsersTab";
import { CreateStudentDialog } from "@/features/users/components/CreateStudentDialog";
import type { CreateStudentFormData } from "@/features/users/types";
import { DeleteConfirmationDialog } from "@/shared/components/ui/DeleteConfirmationDialog";

export default function UsersPage() {
  if (currentUser.role !== "professor" && currentUser.name !== "Markus") {
    redirect("/schedule");
  }

  const {
    users: allUsers,
    loading: usersLoading,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  const [userSearch, setUserSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<Program | "all">("all");
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);

  // Filtering logic
  const { filteredUsers: users } = useDashboardUserFilters({
    allUsers,
    programFilter,
    searchQuery: userSearch,
  });

  // Operations
  const { handleCreateOrEditStudent, handleDeleteStudent } =
    useDashboardUserOperations({
      createUser,
      updateUser,
      deleteUser,
    });

  const handleCreateOrEditStudentWrapper = async (
    data: CreateStudentFormData
  ) => {
    try {
      await handleCreateOrEditStudent(editingStudent, data);
      setEditingStudent(null);
      setIsCreateStudentOpen(false);
    } catch (error) {
      // Error already logged in hook
    }
  };

  const handleOpenEditStudent = (user: User) => {
    setEditingStudent(user);
    setIsCreateStudentOpen(true);
  };

  const handleDeleteStudentWrapper = async (userId: number) => {
    try {
      await handleDeleteStudent(userId);
      setStudentToDelete(null);
    } catch (error) {
      // Error already logged in hook
    }
  };

  return (
    <>
      <UsersTab
        users={users}
        filteredUsers={users}
        programFilter={programFilter}
        userSearch={userSearch}
        onProgramFilterChange={setProgramFilter}
        onUserSearchChange={setUserSearch}
        onEdit={handleOpenEditStudent}
        onDelete={setStudentToDelete}
        onCreate={() => {
          setEditingStudent(null);
          setIsCreateStudentOpen(true);
        }}
        loading={usersLoading}
      />

      <CreateStudentDialog
        isOpen={isCreateStudentOpen}
        onOpenChange={(open) => {
          setIsCreateStudentOpen(open);
          if (!open) {
            setEditingStudent(null);
          }
        }}
        onSubmit={handleCreateOrEditStudentWrapper}
        mode={editingStudent ? "edit" : "create"}
        initialData={editingStudent || undefined}
      />

      <DeleteConfirmationDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            handleDeleteStudentWrapper(studentToDelete.id);
          }
        }}
        title="Student löschen?"
        description="Möchten Sie den folgenden Studenten wirklich löschen?"
        itemName={studentToDelete?.name}
        itemDetails={studentToDelete?.email}
      />
    </>
  );
}
