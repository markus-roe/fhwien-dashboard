"use client";

import { useMemo, useState } from "react";
import { type User, type Program, currentUser } from "@/data/mockData";
import { redirect } from "next/navigation";
import { useUsers } from "@/hooks/useUsers";
import { useDashboardTabs } from "@/hooks/useDashboardTabs";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UsersTab } from "@/components/dashboard/UsersTab";
import {
  CreateStudentDialog,
  type CreateStudentFormData,
} from "@/components/dashboard/CreateStudentDialog";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";

export default function UsersPage() {
  if (currentUser.role !== "professor" && currentUser.name !== "Markus") {
    redirect("/schedule");
  }

  const {
    users: allUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  const [userSearch, setUserSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<Program | "all">("all");
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);

  const users = useMemo(() => {
    let filtered = allUsers;

    if (programFilter !== "all") {
      filtered = filtered.filter((user) => user.program === programFilter);
    }

    if (userSearch.trim()) {
      const query = userSearch.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allUsers, programFilter, userSearch]);

  const handleCreateOrEditStudent = async (data: CreateStudentFormData) => {
    try {
      if (editingStudent) {
        await updateUser(editingStudent.id, {
          name: data.name,
          email: data.email,
          program: data.program,
          initials: data.initials,
          role: "student",
        });
        setEditingStudent(null);
      } else {
        await createUser({
          name: data.name,
          email: data.email,
          program: data.program,
          initials: data.initials,
          role: "student",
        });
      }
      setIsCreateStudentOpen(false);
    } catch (error) {
      console.error("Failed to save student:", error);
    }
  };

  const handleOpenEditStudent = (user: User) => {
    setEditingStudent(user);
    setIsCreateStudentOpen(true);
  };

  const handleDeleteStudent = async (userId: string) => {
    try {
      await deleteUser(userId);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  const dashboardTabs = useDashboardTabs();

  return (
    <>
      <DashboardLayout activeTab="users" tabs={dashboardTabs}>
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
        />
      </DashboardLayout>

      <CreateStudentDialog
        isOpen={isCreateStudentOpen}
        onOpenChange={(open) => {
          setIsCreateStudentOpen(open);
          if (!open) {
            setEditingStudent(null);
          }
        }}
        onSubmit={handleCreateOrEditStudent}
        mode={editingStudent ? "edit" : "create"}
        initialData={editingStudent || undefined}
      />

      <DeleteConfirmationDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={() => {
          if (studentToDelete) {
            handleDeleteStudent(studentToDelete.id);
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
