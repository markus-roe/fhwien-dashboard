import type { Session } from "@/data/mockData";
import type { CalendarEvent } from "../types/calendar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// Helper to convert Session to CalendarEvent
export const sessionToEvent = (session: Session): CalendarEvent => {
  const startTime = new Date(session.date);
  const [startHours, startMinutes] = session.time.split(":").map(Number);
  startTime.setHours(startHours, startMinutes, 0, 0);

  const endTime = new Date(session.date);
  const [endHours, endMinutes] = session.endTime.split(":").map(Number);
  endTime.setHours(endHours, endMinutes, 0, 0);

  return {
    id: session.id,
    summary: session.title,
    startTime,
    endTime,
    session,
  };
};

// Helper to get color for a session
export const getSessionColor = (session: Session): string => {
  // Color by session type
  if (session.type === "lecture") return "#012f64"; // blue
  if (session.type === "workshop") return "#10b981"; // green
  if (session.type === "coaching") return "#f59e0b"; // amber
  return "#888"; // default gray
};

// Format event time range
export const formatEventTime = (event: CalendarEvent): string => {
  return `${format(event.startTime, "HH:mm", { locale: de })} - ${format(
    event.endTime,
    "HH:mm",
    { locale: de }
  )}`;
};

// Get event duration in hours
export const getEventDuration = (event: CalendarEvent): number => {
  return (
    (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60)
  ); // hours
};

