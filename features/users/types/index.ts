import type { Program, UserRole } from "@/shared/lib/api-types";

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
