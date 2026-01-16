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
 * For use with TZID parameter (local time in Europe/Vienna timezone)
 * Converts the date to Europe/Vienna timezone before formatting
 */
function formatIcalDateLocal(date: Date): string {
  // Use Intl.DateTimeFormat to get the time components in Europe/Vienna timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Vienna",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const day = parts.find((p) => p.type === "day")?.value || "";
  const hours = parts.find((p) => p.type === "hour")?.value || "";
  const minutes = parts.find((p) => p.type === "minute")?.value || "";
  const seconds = parts.find((p) => p.type === "second")?.value || "";

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
 * Treats the time as local time in Europe/Vienna timezone
 */
function parseDateTime(dateStr: string | Date, timeStr: string): Date {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  // Create date with year, month, day from date, and time from timeStr
  // We need to treat this as local time in Europe/Vienna
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Create a date in local timezone (which should be Europe/Vienna)
  // This ensures the time is interpreted correctly
  const result = new Date(year, month, day, hours, minutes || 0, 0, 0);
  
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
 * @param startDateTime - Original Date object from database (for correct timezone handling)
 * @param endDateTime - Original Date object from database (for correct timezone handling)
 */
export function sessionToIcalEvent(
  session: Session,
  course?: Course,
  updatedAt?: Date,
  startDateTime?: Date,
  endDateTime?: Date
): string {
  // Use original Date objects if provided, otherwise parse from session
  const startDate = startDateTime || parseDateTime(session.date, session.time);
  const endDate = endDateTime || parseDateTime(session.date, session.endTime);
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
 * @param startDateTime - Original Date object from database (for correct timezone handling)
 * @param endDateTime - Original Date object from database (for correct timezone handling)
 */
export function coachingSlotToIcalEvent(
  slot: CoachingSlot,
  course?: Course,
  updatedAt?: Date,
  startDateTime?: Date,
  endDateTime?: Date
): string {
  // Use original Date objects if provided, otherwise parse from slot
  const startDate = startDateTime || parseDateTime(slot.date, slot.time);
  const endDate = endDateTime || parseDateTime(slot.date, slot.endTime);
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
  dbCoachingSlots?: Array<{ id: number; updatedAt: Date }>,
  sessionDates?: Map<number, { start: Date; end: Date }>,
  coachingSlotDates?: Map<number, { start: Date; end: Date }>
): string {
  const now = new Date();
  const events: string[] = [];

  // Add sessions
  for (const session of sessions) {
    const course = courses.find((c) => c.id === session.courseId);
    const dbSession = dbSessions?.find((s) => s.id === session.id);
    const dates = sessionDates?.get(session.id);
    events.push(
      sessionToIcalEvent(
        session,
        course,
        dbSession?.updatedAt,
        dates?.start,
        dates?.end
      )
    );
  }

  // Add coaching slots
  for (const slot of coachingSlots) {
    const course = courses.find((c) => c.id === slot.courseId);
    const dbSlot = dbCoachingSlots?.find((s) => s.id === slot.id);
    const dates = coachingSlotDates?.get(slot.id);
    events.push(
      coachingSlotToIcalEvent(
        slot,
        course,
        dbSlot?.updatedAt,
        dates?.start,
        dates?.end
      )
    );
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
