import { format, isPast, isToday } from "date-fns";
import { de } from "date-fns/locale";
import type { Session, CoachingSlot } from "@/shared/lib/api-types";

/**
 * Calculates the duration between two time strings
 */
export function calculateDuration(startTime: string, endTime: string): string {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const start = startHours * 60 + startMinutes;
  const end = endHours * 60 + endMinutes;
  const diff = end - start;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Gets the end datetime of a session
 */
export function getSessionEndDateTime(session: Session): Date {
  const sessionEndDateTime = new Date(session.date);
  if (session.endTime) {
    const [hours, minutes] = session.endTime.split(":").map(Number);
    sessionEndDateTime.setHours(hours, minutes, 0, 0);
  } else {
    const [hours, minutes] = session.time.split(":").map(Number);
    sessionEndDateTime.setHours(hours, minutes, 0, 0);
  }
  return sessionEndDateTime;
}

/**
 * Gets the end datetime of a coaching slot
 */
export function getCoachingSlotEndDateTime(slot: CoachingSlot): Date {
  const slotEndDateTime = new Date(slot.date);
  const [hours, minutes] = slot.endTime.split(":").map(Number);
  slotEndDateTime.setHours(hours, minutes, 0, 0);
  return slotEndDateTime;
}

/**
 * Checks if a session is in the past
 */
export function isSessionPast(session: Session): boolean {
  const now = new Date();
  return getSessionEndDateTime(session) < now;
}

/**
 * Checks if a coaching slot is in the past
 */
export function isCoachingSlotPast(slot: CoachingSlot): boolean {
  const now = new Date();
  return getCoachingSlotEndDateTime(slot) < now;
}

/**
 * Formats a date for display in dashboard tables
 */
export function getDateLabel(date: Date): string {
  return format(date, "EEE d.M.yyyy", { locale: de });
}

/**
 * Gets date styling classes based on date state
 */
export function getDateClasses(date: Date): {
  iconClass: string;
  textClass: string;
} {
  const isPastDate = isPast(date) && !isToday(date);
  const isTodayDate = isToday(date);

  return {
    iconClass: isPastDate
      ? "text-zinc-400"
      : isTodayDate
      ? "text-blue-600"
      : "text-zinc-500",
    textClass: isPastDate ? "text-zinc-400" : "text-zinc-900",
  };
}

/**
 * Sorts sessions by date and time
 */
export function sortSessionsByDateTime(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => {
    // First sort by date
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const dateDiff = dateA.getTime() - dateB.getTime();
    if (dateDiff !== 0) return dateDiff;

    // Then sort by time
    const [aHours, aMinutes] = a.time.split(":").map(Number);
    const [bHours, bMinutes] = b.time.split(":").map(Number);
    return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
  });
}

/**
 * Sorts coaching slots by date and time
 */
export function sortCoachingSlotsByDateTime(
  slots: CoachingSlot[]
): CoachingSlot[] {
  return [...slots].sort((a, b) => {
    // First sort by date
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const dateDiff = dateA.getTime() - dateB.getTime();
    if (dateDiff !== 0) return dateDiff;

    // Then sort by time
    const [aHours, aMinutes] = a.time.split(":").map(Number);
    const [bHours, bMinutes] = b.time.split(":").map(Number);
    return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
  });
}
