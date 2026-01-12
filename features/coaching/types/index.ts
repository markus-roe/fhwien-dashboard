import type { LocationType, User } from "@/shared/lib/api-types";

/**
 * Form data for creating or editing a coaching slot
 */
export type CreateCoachingSlotFormData = {
  courseId: number;
  date: Date;
  time: string;
  endTime: string;
  location: string;
  locationType: LocationType;
  maxParticipants: number;
  participantIds: number[];
  description?: string;
};
