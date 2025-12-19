import type { LocationType } from "@/shared/data/mockData";

/**
 * Form data for creating or editing a coaching slot
 */
export type CreateCoachingSlotFormData = {
  courseId: string;
  date: Date;
  time: string;
  endTime: string;
  location: string;
  locationType: LocationType;
  maxParticipants: number;
  participants: string[];
  description?: string;
};
