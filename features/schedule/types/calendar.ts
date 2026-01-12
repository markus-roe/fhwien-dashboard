import type { Session } from "@/shared/lib/api-types";

export type ViewType = "month" | "week" | "day" | "list";

// Internal event format for calendar rendering
export interface CalendarEvent {
  id: number;
  summary: string;
  startTime: Date;
  endTime: Date;
  session: Session;
}
