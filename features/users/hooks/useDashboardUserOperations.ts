import { useCallback } from "react";
import type { User } from "@/shared/data/mockData";
import type { CreateStudentFormData } from "@/features/users/types";

type UseDashboardUserOperationsProps = {
  createUser: (data: {
    name: string;
    email: string;
    program: "DTI" | "DI";
    initials: string;
    role: "student" | "professor";
  }) => Promise<User>;
  updateUser: (
    id: number,
    data: {
      name: string;
      email: string;
      program: "DTI" | "DI";
      initials: string;
      role: "student" | "professor";
    }
  ) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
};

export function useDashboardUserOperations({
  createUser,
  updateUser,
  deleteUser,
}: UseDashboardUserOperationsProps) {
  const handleCreateOrEditStudent = useCallback(
    async (editingStudent: User | null, data: CreateStudentFormData) => {
      try {
        if (editingStudent) {
          await updateUser(editingStudent.id, {
            name: data.name,
            email: data.email,
            program: data.program,
            initials: data.initials,
            role: "student",
          });
        } else {
          await createUser({
            name: data.name,
            email: data.email,
            program: data.program,
            initials: data.initials,
            role: "student",
          });
        }
      } catch (error) {
        console.error("Failed to save student:", error);
        throw error;
      }
    },
    [createUser, updateUser]
  );

  const handleDeleteStudent = useCallback(
    async (userId: number) => {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error("Failed to delete student:", error);
        throw error;
      }
    },
    [deleteUser]
  );

  return {
    handleCreateOrEditStudent,
    handleDeleteStudent,
  };
}
