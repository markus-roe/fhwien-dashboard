import {
    PrismaClient,
    SessionType,
    LocationType,
    Attendance
} from "../generated/client.js";
import { getCourseIdByCode } from "./seedCourses.js";

// Session data - uses course codes, will be resolved to IDs at runtime
interface SessionData {
    courseCode: string;
    type: SessionType;
    title: string;
    startDateTime: Date;
    endDateTime: Date;
    location: string;
    locationType: LocationType;
    attendance: Attendance;
    objectives: string[];
}

// All sessions from mockData.ts
const sessions: SessionData[] = [
    {
        courseCode: "networks",
        type: SessionType.lecture,
        title: "Innovation Teams and Networks IL",
        startDateTime: new Date("2025-09-26T15:45:00+02:00"),
        endDateTime: new Date("2025-09-26T19:15:00+02:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "inno",
        type: SessionType.lecture,
        title: "Innovation Design IL",
        startDateTime: new Date("2025-10-03T15:45:00+02:00"),
        endDateTime: new Date("2025-10-03T19:15:00+02:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "networks",
        type: SessionType.lecture,
        title: "Innovation Teams and Networks IL",
        startDateTime: new Date("2025-10-04T08:30:00+02:00"),
        endDateTime: new Date("2025-10-04T12:00:00+02:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "hti",
        type: SessionType.lecture,
        title: "Einstieg in Human Technology Interaction",
        startDateTime: new Date("2025-10-16T18:30:00+02:00"),
        endDateTime: new Date("2025-10-16T20:05:00+02:00"),
        location: "Microsoft Teams",
        locationType: LocationType.online,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "inno",
        type: SessionType.lecture,
        title: "Innovation Design IL",
        startDateTime: new Date("2025-10-17T15:45:00+02:00"),
        endDateTime: new Date("2025-10-17T19:15:00+02:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "ds",
        type: SessionType.lecture,
        title: "Data Science IL",
        startDateTime: new Date("2025-10-18T08:30:00+02:00"),
        endDateTime: new Date("2025-10-18T12:00:00+02:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "software",
        type: SessionType.workshop,
        title: "Werkstatt UE",
        startDateTime: new Date("2025-10-18T13:00:00+02:00"),
        endDateTime: new Date("2025-10-18T16:30:00+02:00"),
        location: "Online",
        locationType: LocationType.online,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "ds",
        type: SessionType.lecture,
        title: "Einführung Datenmodellierungssoftware",
        startDateTime: new Date("2025-10-21T18:30:00+02:00"),
        endDateTime: new Date("2025-10-21T20:05:00+02:00"),
        location: "Microsoft Teams",
        locationType: LocationType.online,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "software",
        type: SessionType.lecture,
        title: "Software Intro",
        startDateTime: new Date("2025-10-23T18:30:00+02:00"),
        endDateTime: new Date("2025-10-23T20:05:00+02:00"),
        location: "Microsoft Teams",
        locationType: LocationType.online,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "hti",
        type: SessionType.lecture,
        title: "Human-Technology-Interaction IL",
        startDateTime: new Date("2025-11-07T15:45:00+01:00"),
        endDateTime: new Date("2025-11-07T19:15:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "ds",
        type: SessionType.lecture,
        title: "Data Science IL",
        startDateTime: new Date("2025-11-08T08:30:00+01:00"),
        endDateTime: new Date("2025-11-08T12:00:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "software",
        type: SessionType.lecture,
        title: "Agile Software Engineering IL",
        startDateTime: new Date("2025-11-08T13:00:00+01:00"),
        endDateTime: new Date("2025-11-08T16:30:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "inno",
        type: SessionType.lecture,
        title: "Strategic Fit and Timing",
        startDateTime: new Date("2025-11-13T18:30:00+01:00"),
        endDateTime: new Date("2025-11-13T19:55:00+01:00"),
        location: "Microsoft Teams",
        locationType: LocationType.online,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "inno",
        type: SessionType.lecture,
        title: "Gendered Design 1",
        startDateTime: new Date("2025-11-18T18:30:00+01:00"),
        endDateTime: new Date("2025-11-18T20:05:00+01:00"),
        location: "Microsoft Teams",
        locationType: LocationType.online,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "software",
        type: SessionType.lecture,
        title: "Agile Software Engineering IL",
        startDateTime: new Date("2025-11-21T15:45:00+01:00"),
        endDateTime: new Date("2025-11-21T19:15:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "inno",
        type: SessionType.lecture,
        title: "Innovation Design IL",
        startDateTime: new Date("2025-11-22T08:30:00+01:00"),
        endDateTime: new Date("2025-11-22T12:00:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "ds",
        type: SessionType.lecture,
        title: "Data Science IL",
        startDateTime: new Date("2025-11-22T13:00:00+01:00"),
        endDateTime: new Date("2025-11-22T16:30:00+01:00"),
        location: "B501",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "networks",
        type: SessionType.lecture,
        title: "Schlussveranstaltung Netzwerken - Lessons Learned",
        startDateTime: new Date("2025-11-25T20:10:00+01:00"),
        endDateTime: new Date("2025-11-25T21:45:00+01:00"),
        location: "Microsoft Teams",
        locationType: LocationType.online,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "inno",
        type: SessionType.lecture,
        title: "Ziele, Zielgruppen, Personas",
        startDateTime: new Date("2025-11-27T18:30:00+01:00"),
        endDateTime: new Date("2025-11-27T20:05:00+01:00"),
        location: "Microsoft Teams",
        locationType: LocationType.online,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "software",
        type: SessionType.workshop,
        title: "Werkstatt UE",
        startDateTime: new Date("2025-12-05T15:45:00+01:00"),
        endDateTime: new Date("2025-12-05T19:15:00+01:00"),
        location: "Online",
        locationType: LocationType.online,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "ds",
        type: SessionType.lecture,
        title: "Data Science IL",
        startDateTime: new Date("2025-12-06T08:30:00+01:00"),
        endDateTime: new Date("2025-12-06T12:00:00+01:00"),
        location: "B502",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "hti",
        type: SessionType.lecture,
        title: "Human-Technology-Interaction IL",
        startDateTime: new Date("2025-12-06T13:00:00+01:00"),
        endDateTime: new Date("2025-12-06T16:30:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "software",
        type: SessionType.lecture,
        title: "Agile Software Engineering IL",
        startDateTime: new Date("2025-12-19T15:45:00+01:00"),
        endDateTime: new Date("2025-12-19T19:15:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "inno",
        type: SessionType.lecture,
        title: "Innovation Design IL",
        startDateTime: new Date("2025-12-20T08:30:00+01:00"),
        endDateTime: new Date("2025-12-20T12:00:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "hti",
        type: SessionType.lecture,
        title: "Human-Technology-Interaction IL",
        startDateTime: new Date("2025-12-20T13:00:00+01:00"),
        endDateTime: new Date("2025-12-20T16:30:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    // Future sessions (2026)
    {
        courseCode: "software",
        type: SessionType.lecture,
        title: "Agile Software Engineering IL",
        startDateTime: new Date("2026-01-16T15:45:00+01:00"),
        endDateTime: new Date("2026-01-16T19:15:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "networks",
        type: SessionType.lecture,
        title: "Innovation Teams and Networks IL",
        startDateTime: new Date("2026-01-17T08:30:00+01:00"),
        endDateTime: new Date("2026-01-17T12:00:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
    {
        courseCode: "hti",
        type: SessionType.lecture,
        title: "Human-Technology-Interaction IL",
        startDateTime: new Date("2026-01-17T13:00:00+01:00"),
        endDateTime: new Date("2026-01-17T16:30:00+01:00"),
        location: "B309",
        locationType: LocationType.on_campus,
        attendance: Attendance.mandatory,
        objectives: [],
    },
];

export async function seedSessions(prisma: PrismaClient) {
    console.log('📅 Seeding sessions...');

    let count = 0;

    for (const session of sessions) {
        // Get course ID by code
        const courseId = await getCourseIdByCode(prisma, session.courseCode);

        if (!courseId) {
            console.warn(`  ⚠️ Skipping session "${session.title}": Course "${session.courseCode}" not found`);
            continue;
        }

        // Check if session already exists (by unique combination of courseId, title, startDateTime)
        const existingSession = await prisma.session.findFirst({
            where: {
                courseId,
                title: session.title,
                startDateTime: session.startDateTime,
            },
        });

        if (existingSession) {
            // Update existing session
            await prisma.session.update({
                where: { id: existingSession.id },
                data: {
                    type: session.type,
                    endDateTime: session.endDateTime,
                    location: session.location,
                    locationType: session.locationType,
                    attendance: session.attendance,
                    objectives: session.objectives,
                },
            });
        } else {
            // Create new session
            await prisma.session.create({
                data: {
                    courseId,
                    type: session.type,
                    title: session.title,
                    startDateTime: session.startDateTime,
                    endDateTime: session.endDateTime,
                    location: session.location,
                    locationType: session.locationType,
                    attendance: session.attendance,
                    objectives: session.objectives,
                },
            });
        }
        count++;
    }

    console.log(`  ✅ Seeded ${count} sessions`);
}
