import type { Session } from "@/shared/data/mockData";

export type ViewType = "month" | "week" | "day" | "list";

// Internal event format for calendar rendering
export interface CalendarEvent {
  id: string;
  summary: string;
  startTime: Date;
  endTime: Date;
  session: Session;
}
