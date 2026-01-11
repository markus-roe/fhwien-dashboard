import type { LocationType, Attendance } from "@/shared/lib/api-types";

/**
 * Form data for editing a session
 */
export type EditSessionFormState = {
  courseId: number | null;
  title: string;
  date: Date;
  time: string;
  endTime: string;
  location: string;
  locationType: LocationType;
  attendance: Attendance;
  notes: string;
};
