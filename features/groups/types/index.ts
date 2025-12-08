/**
 * Form data for creating a group
 */
export type CreateGroupFormData = {
  courseId: string;
  name: string;
  description?: string;
  maxMembers?: number;
};
