import type { Session, CoachingSlot, Course } from "./api-types";

/**
 * Escapes special characters in iCal text fields
 */
function escapeIcalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Formats a date to iCal format (YYYYMMDDTHHMMSS)
 * For use with TZID parameter (local time without offset)
 */
function formatIcalDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Formats a date to iCal format (YYYYMMDDTHHMMSSZ)
 * For use as UTC timestamp (DTSTAMP)
 */
function formatIcalDateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Parses a date string and time string to a Date object
 */
function parseDateTime(dateStr: string | Date, timeStr: string): Date {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes || 0, 0, 0);
  return result;
}

/**
 * Generates a unique UID for an iCal event
 */
function generateUid(id: number, type: "session" | "coaching"): string {
  return `fhwien-${type}-${id}@dashboard.fhwien.ac.at`;
}

/**
 * Converts a Session to an iCal event
 */
export function sessionToIcalEvent(
  session: Session,
  course?: Course,
  updatedAt?: Date
): string {
  const startDate = parseDateTime(session.date, session.time);
  const endDate = parseDateTime(session.date, session.endTime);
  const uid = generateUid(session.id, "session");
  const now = new Date();

  const title = escapeIcalText(session.title);
  const location = escapeIcalText(session.location);
  const courseTitle = course ? escapeIcalText(course.title) : "";
  const lecturer = session.lecturer
    ? escapeIcalText(`Dozent: ${session.lecturer.name}`)
    : "";
  const attendance = session.attendance === "mandatory" ? "Pflicht" : "Optional";
  const objectives =
    session.objectives && session.objectives.length > 0
      ? escapeIcalText(`\n\nLernziele:\n${session.objectives.join("\n")}`)
      : "";

  const description = [
    courseTitle && `Kurs: ${courseTitle}`,
    lecturer,
    `Anwesenheit: ${attendance}`,
    objectives,
  ]
    .filter(Boolean)
    .join("\n");

  // Calculate SEQUENCE based on updatedAt timestamp (increases when event is modified)
  // Use seconds since epoch as sequence number to ensure it increases on updates
  const sequence = updatedAt ? Math.floor(updatedAt.getTime() / 1000) % 1000000 : 0;

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcalDateUTC(now)}`,
    `DTSTART;TZID=Europe/Vienna:${formatIcalDateLocal(startDate)}`,
    `DTEND;TZID=Europe/Vienna:${formatIcalDateLocal(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:${sequence}`,
    updatedAt ? `LAST-MODIFIED:${formatIcalDateUTC(updatedAt)}` : "",
    "END:VEVENT",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/**
 * Converts a CoachingSlot to an iCal event
 */
export function coachingSlotToIcalEvent(
  slot: CoachingSlot,
  course?: Course,
  updatedAt?: Date
): string {
  const startDate = parseDateTime(slot.date, slot.time);
  const endDate = parseDateTime(slot.date, slot.endTime);
  const uid = generateUid(slot.id, "coaching");
  const now = new Date();

  const courseTitle = course ? escapeIcalText(course.title) : "";
  const title = escapeIcalText(`${courseTitle} Coaching`);
  const description = slot.description
    ? escapeIcalText(slot.description)
    : `Coaching-Termin für ${courseTitle}`;

  // Calculate SEQUENCE based on updatedAt timestamp
  const sequence = updatedAt ? Math.floor(updatedAt.getTime() / 1000) % 1000000 : 0;

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcalDateUTC(now)}`,
    `DTSTART;TZID=Europe/Vienna:${formatIcalDateLocal(startDate)}`,
    `DTEND;TZID=Europe/Vienna:${formatIcalDateLocal(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:Online`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:${sequence}`,
    updatedAt ? `LAST-MODIFIED:${formatIcalDateUTC(updatedAt)}` : "",
    "END:VEVENT",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/**
 * Generates a complete iCal file content from sessions and coaching slots
 */
export function generateIcalFile(
  sessions: Session[],
  coachingSlots: CoachingSlot[],
  courses: Course[],
  dbSessions?: Array<{ id: number; updatedAt: Date }>,
  dbCoachingSlots?: Array<{ id: number; updatedAt: Date }>
): string {
  const now = new Date();
  const events: string[] = [];

  // Add sessions
  for (const session of sessions) {
    const course = courses.find((c) => c.id === session.courseId);
    const dbSession = dbSessions?.find((s) => s.id === session.id);
    events.push(sessionToIcalEvent(session, course, dbSession?.updatedAt));
  }

  // Add coaching slots
  for (const slot of coachingSlots) {
    const course = courses.find((c) => c.id === slot.courseId);
    const dbSlot = dbCoachingSlots?.find((s) => s.id === slot.id);
    events.push(coachingSlotToIcalEvent(slot, course, dbSlot?.updatedAt));
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FH Wien Dashboard//Calendar Export//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Vienna",
    "BEGIN:STANDARD",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
    `X-WR-CALNAME:FH Wien Dashboard`,
    `X-WR-CALDESC:Termine aus dem FH Wien Dashboard`,
    `X-WR-TIMEZONE:Europe/Vienna`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}
