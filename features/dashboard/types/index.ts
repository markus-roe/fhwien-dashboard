import type { LocationType } from "@/shared/data/mockData";

/**
 * Form data for editing a session
 */
export type EditSessionFormState = {
  courseId: string | null;
  title: string;
  date: Date;
  time: string;
  endTime: string;
  location: string;
  locationType: LocationType;
  attendance: "mandatory" | "optional";
  notes: string;
};
