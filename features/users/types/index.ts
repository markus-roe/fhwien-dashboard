import type { Program, UserRole } from "@/shared/data/mockData";

/**
 * Form data for creating or editing a student/user
 */
export type CreateStudentFormData = {
  name: string;
  email: string;
  program: Program;
  role: UserRole;
  initials: string;
};
