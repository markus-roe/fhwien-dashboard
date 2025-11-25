export type Program = "DTI" | "DI";
export type SessionType = "lecture" | "workshop" | "coaching";
export type LocationType = "online" | "on-campus";

export interface Course {
  id: string;
  title: string;
  program: Program;
}

export interface Session {
  id: string;
  courseId: string;
  type: SessionType;
  title: string;
  program: Program;
  date: Date;
  time: string;
  endTime: string;
  duration: string;
  location: string;
  locationType: LocationType;
  lecturer?: {
    name: string;
    initials: string;
  };
  attendance: "mandatory" | "optional";
  objectives: string[];
  materials: Material[];
  participants?: number;
  isLive?: boolean;
  groupId?: string; // Link to group if this is a group appointment
}

export interface Material {
  id: string;
  name: string;
  size: string;
  addedDate: string;
  type: "pdf" | "presentation" | "other";
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed?: boolean;
  course: Course;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  program: Program;
}

export interface Group {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  maxMembers?: number;
  members: User[];
  createdAt: Date;
}

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: "c1",
    title: "Data Science",
    program: "DTI",
  },
  {
    id: "c2",
    title: "Human-Technology Interaction",
    program: "DTI",
  },
  {
    id: "c3",
    title: "Innovation Design",
    program: "DTI",
  },
  {
    id: "c4",
    title: "Innovation Teams and Networks",
    program: "DTI",
  },
  {
    id: "c5",
    title: "Agile Software Engineering",
    program: "DTI",
  },
  {
    id: "c6",
    title: "Data Governance",
    program: "DTI", 
  },
  {
    id: "c7",
    title: "Cloud-based IT-Infrastructure",
    program: "DI",
  },
];

// Mock Sessions
export const mockSessions: Session[] = [
  {
    id: "s1",
    courseId: "c4",
    type: "lecture",
    title: "Innovation Teams and Networks IL",
    program: "DTI",
    date: new Date("2025-09-26T15:45:00+02:00"),
    time: "15:45",
    endTime: "19:15",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s2",
    courseId: "c3",
    type: "lecture",
    title: "Innovation Design IL",
    program: "DTI",
    date: new Date("2025-10-03T15:45:00+02:00"),
    time: "15:45",
    endTime: "19:15",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s3",
    courseId: "c4",
    type: "lecture",
    title: "Innovation Teams and Networks IL",
    program: "DTI",
    date: new Date("2025-10-04T08:30:00+02:00"),
    time: "08:30",
    endTime: "12:00",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s4",
    courseId: "c2",
    type: "lecture",
    title: '[DTI] LV "Einstieg in Human Technology Interaction"',
    program: "DTI",
    date: new Date("2025-10-16T18:30:00+02:00"),
    time: "18:30",
    endTime: "20:05",
    duration: "1h 35m",
    location: "Microsoft Teams",
    locationType: "online",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s5",
    courseId: "c3",
    type: "lecture",
    title: "Innovation Design IL",
    program: "DTI",
    date: new Date("2025-10-17T15:45:00+02:00"),
    time: "15:45",
    endTime: "19:15",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s6",
    courseId: "c1",
    type: "lecture",
    title: "Data Science IL",
    program: "DTI",
    date: new Date("2025-10-18T08:30:00+02:00"),
    time: "08:30",
    endTime: "12:00",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s7",
    courseId: "c6",
    type: "workshop",
    title: "Werkstatt UE",
    program: "DTI",
    date: new Date("2025-10-18T13:00:00+02:00"),
    time: "13:00",
    endTime: "16:30",
    duration: "3h 30m",
    location: "Online",
    locationType: "online",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s8",
    courseId: "c1",
    type: "lecture",
    title: "[all DI/DTI] Einführung Datenmodellierungssoftware",
    program: "DTI",
    date: new Date("2025-10-21T18:30:00+02:00"),
    time: "18:30",
    endTime: "20:05",
    duration: "1h 35m",
    location: "Microsoft Teams",
    locationType: "online",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s9",
    courseId: "c1",
    type: "lecture",
    title: "Software Intro",
    program: "DTI",
    date: new Date("2025-10-23T18:30:00+02:00"),
    time: "18:30",
    endTime: "20:05",
    duration: "1h 35m",
    location: "Microsoft Teams",
    locationType: "online",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s10",
    courseId: "c3",
    type: "coaching",
    title: "Coaching Termin Gruppe (7/10)",
    program: "DTI",
    date: new Date("2025-10-28T18:30:00+01:00"),
    time: "18:30",
    endTime: "19:15",
    duration: "45m",
    location: "Microsoft Teams",
    locationType: "online",
    attendance: "optional",
    objectives: [],
    materials: [],
  },
  {
    id: "s11",
    courseId: "c1",
    type: "coaching",
    title: "Data Science Coaching",
    program: "DTI",
    date: new Date("2025-10-28T20:00:00+01:00"),
    time: "20:00",
    endTime: "20:20",
    duration: "20m",
    location: "Online",
    locationType: "online",
    attendance: "optional",
    objectives: [],
    materials: [],
  },
  {
    id: "s12",
    courseId: "c2",
    type: "lecture",
    title: "Human-Technology-Interaction IL",
    program: "DTI",
    date: new Date("2025-11-07T15:45:00+01:00"),
    time: "15:45",
    endTime: "19:15",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s13",
    courseId: "c1",
    type: "lecture",
    title: "Data Science IL",
    program: "DTI",
    date: new Date("2025-11-08T08:30:00+01:00"),
    time: "08:30",
    endTime: "12:00",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s14",
    courseId: "c5",
    type: "lecture",
    title: "Agile Software Engineering IL",
    program: "DTI",
    date: new Date("2025-11-08T12:00:00+01:00"),
    time: "13:00",
    endTime: "16:30",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s15",
    courseId: "c3",
    type: "lecture",
    title: "Innovation Design IL",
    program: "DTI",
    date: new Date("2025-11-22T08:40:00+01:00"),
    time: "08:30",
    endTime: "12:00",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s16",
    courseId: "c1",
    type: "lecture",
    title: "Data Science IL",
    program: "DTI",
    date: new Date("2025-11-22T12:00:00+01:00"),
    time: "13:00",
    endTime: "16:30",
    duration: "3h 30m",
    location: "B501",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s18",
    courseId: "c3",
    type: "lecture",
    title: "Innovation Design IL",
    program: "DTI",
    date: new Date("2025-12-20T08:30:00+01:00"),
    time: "08:30",
    endTime: "12:00",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s19",
    courseId: "c2",
    type: "lecture",
    title: "Human-Technology-Interaction IL",
    program: "DTI",
    date: new Date("2025-12-20T12:00:00+01:00"),
    time: "13:00",
    endTime: "16:30",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s20",
    courseId: "c2",
    type: "lecture",
    title: "Human-Technology-Interaction IL",
    program: "DTI",
    date: new Date("2025-12-06T12:00:00+01:00"),
    time: "13:00",
    endTime: "16:30",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s21",
    courseId: "c1",
    type: "lecture",
    title: "Data Science IL",
    program: "DTI",
    date: new Date("2025-12-06T08:30:00+01:00"),
    time: "08:30",
    endTime: "12:00",
    duration: "3h 30m",
    location: "B502",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s22",
    courseId: "c6",
    type: "workshop",
    title: "Werkstatt UE",
    program: "DTI",
    date: new Date("2025-12-05T15:45:00+01:00"),
    time: "15:45",
    endTime: "19:15",
    duration: "3h 30m",
    location: "Online",
    locationType: "online",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s24",
    courseId: "c3",
    type: "lecture",
    title: 'LV "Strategic Fit and Timing"',
    program: "DTI",
    date: new Date("2025-11-13T18:30:00+01:00"),
    time: "18:30",
    endTime: "19:55",
    duration: "1h 25m",
    location: "Microsoft Teams",
    locationType: "online",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s25",
    courseId: "c4",
    type: "lecture",
    title: "Schlussveranstaltung Netzwerken - Lessons Learned",
    program: "DTI",
    date: new Date("2025-11-25T20:10:00+01:00"),
    time: "20:10",
    endTime: "21:45",
    duration: "1h 35m",
    location: "Microsoft Teams",
    locationType: "online",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s26",
    courseId: "c3",
    type: "lecture",
    title: '[DTI] LV "Ziele, Zielgruppen, Personas"',
    program: "DTI",
    date: new Date("2025-11-27T18:30:00+01:00"),
    time: "18:30",
    endTime: "20:05",
    duration: "1h 35m",
    location: "Microsoft Teams",
    locationType: "online",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s27",
    courseId: "c3",
    type: "lecture",
    title: '[DTI] LV "Gendered Design 1"',
    program: "DTI",
    date: new Date("2025-11-18T18:30:00+01:00"),
    time: "18:30",
    endTime: "20:05",
    duration: "1h 35m",
    location: "Microsoft Teams",
    locationType: "online",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s28",
    courseId: "c5",
    type: "lecture",
    title: "Agile Software Engineering IL",
    program: "DTI",
    date: new Date("2025-11-21T15:45:00+01:00"),
    time: "15:45",
    endTime: "19:15",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s29",
    courseId: "c5",
    type: "lecture",
    title: "Agile Software Engineering IL",
    program: "DTI",
    date: new Date("2025-12-19T15:45:00+01:00"),
    time: "15:45",
    endTime: "19:15",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s32",
    courseId: "c4",
    type: "coaching",
    title: "Networks Coaching",
    program: "DTI",
    date: new Date("2025-11-11T18:20:00+01:00"),
    time: "18:20",
    endTime: "19:05",
    duration: "45m",
    location: "Online",
    locationType: "online",
    attendance: "optional",
    objectives: [],
    materials: [],
  },
  {
    id: "s33",
    courseId: "c1",
    type: "coaching",
    title: "dataspot coaching",
    program: "DTI",
    date: new Date("2025-11-11T19:10:00+01:00"),
    time: "19:10",
    endTime: "19:30",
    duration: "20m",
    location: "Online",
    locationType: "online",
    attendance: "optional",
    objectives: [],
    materials: [],
  },
  {
    id: "s34",
    courseId: "c2",
    type: "lecture",
    title: "Human-Technology-Interaction IL",
    program: "DTI",
    date: new Date("2026-01-17T12:00:00+01:00"),
    time: "13:00",
    endTime: "16:30",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s35",
    courseId: "c4",
    type: "lecture",
    title: "Innovation Teams and Networks IL",
    program: "DTI",
    date: new Date("2026-01-17T08:30:00+01:00"),
    time: "08:30",
    endTime: "12:00",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s36",
    courseId: "c5",
    type: "lecture",
    title: "Agile Software Engineering IL",
    program: "DTI",
    date: new Date("2026-01-16T15:45:00+01:00"),
    time: "15:45",
    endTime: "19:15",
    duration: "3h 30m",
    location: "B309",
    locationType: "on-campus",
    attendance: "mandatory",
    objectives: [],
    materials: [],
  },
  {
    id: "s37",
    courseId: "c1",
    type: "coaching",
    title: "Data Science Coaching",
    program: "DTI",
    date: new Date("2025-12-02T21:00:00+01:00"),
    time: "21:00",
    endTime: "21:45",
    duration: "45m",
    location: "Online",
    locationType: "online",
    attendance: "optional",
    objectives: [],
    materials: [],
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "3a: Designprinzipien und HTI-Beobachtungen",
    dueDate: "26.11.2025",
    completed: true,
    course: {
      id: "c1",
      title: "4 Interaction",
      program: "DTI",
    },
  },
  {
    id: "t2",
    title: "4a: Designed for Whom?",
    dueDate: "04.12.2025",
    completed: false,
    course: {
      id: "c2",
      title: "4 Interaction",
      program: "DTI",
    },
  },
  {
    id: "t3",
    title: '5a Projekt "Interaktionsdesign',
    dueDate: "04.12.2025",
    completed: false,
    course: {
      id: "c3",
      title: "4 Interaction",
      program: "DTI",
    },
  },
];


// Helper function to get week days
export const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }
  return days;
};

// Helper function to get sessions for a specific day
export const getSessionsForDay = (
  sessions: Session[],
  date: Date
): Session[] => {
  // Normalize dates to compare only date part (ignore time)
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  return sessions.filter((session) => {
    const sessionDate = new Date(
      session.date.getFullYear(),
      session.date.getMonth(),
      session.date.getDate()
    );
    return sessionDate.getTime() === targetDate.getTime();
  });
};

// Helper function to organize sessions by time slots
export const organizeSessionsByTimeSlots = (
  sessions: Session[],
  weekDays: Date[]
): Array<{
  time: string;
  sessions: Array<{
    dayIndex: number;
    session: Session;
  }>;
}> => {
  // Extract all unique time slots from sessions in the week
  const timeSlotSet = new Set<string>();
  weekDays.forEach((day) => {
    const daySessions = getSessionsForDay(sessions, day);
    daySessions.forEach((s) => timeSlotSet.add(s.time));
  });

  // Sort time slots chronologically
  const timeSlots = Array.from(timeSlotSet).sort((a, b) => {
    const [aHours, aMinutes] = a.split(":").map(Number);
    const [bHours, bMinutes] = b.split(":").map(Number);
    return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
  });

  const organized: Array<{
    time: string;
    sessions: Array<{
      dayIndex: number;
      session: Session;
    }>;
  }> = [];

  timeSlots.forEach((time) => {
    const slotSessions: Array<{ dayIndex: number; session: Session }> = [];

    weekDays.forEach((day, dayIndex) => {
      const daySessions = getSessionsForDay(sessions, day);
      const sessionAtTime = daySessions.find((s) => s.time === time);

      if (sessionAtTime) {
        slotSessions.push({
          dayIndex,
          session: sessionAtTime,
        });
      }
    });

    organized.push({
      time,
      sessions: slotSessions,
    });
  });

  return organized;
};

// Mock Groups
export const mockGroups: Group[] = [
  {
    id: "g4",
    courseId: "c1",
    name: "Gruppe 1",
    description: "",
    maxMembers: 7,
    members: [
      {
        id: "m7",
        name: "Emanuel",
        initials: "E",
        email: "emanuel@example.com",
        program: "DTI",
      },
      {
        id: "m8",
        name: "Bence",
        initials: "B",
        email: "bence@example.com",
        program: "DTI",
      },
      {
        id: "m9",
        name: "Simon",
        initials: "S",
        email: "simon@example.com",
        program: "DTI",
      },
      {
        id: "m10",
        name: "Alex",
        initials: "A",
        email: "alex@example.com",
        program: "DTI",
      },
      {
        id: "m11",
        name: "Ozan",
        initials: "O",
        email: "ozan@example.com",
        program: "DTI",
      },
      {
        id: "m12",
        name: "Natalia",
        initials: "N",
        email: "natalia@example.com",
        program: "DTI",
      },
      {
        id: "m13",
        name: "Christoph",
        initials: "C",
        email: "christoph@example.com",
        program: "DTI",
      },
    ],
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g5",
    courseId: "c1",
    name: "Gruppe 2",
    description: "",
    maxMembers: 6,
    members: [
      {
        id: "m14",
        name: "Patrick",
        initials: "P",
        email: "patrick@example.com",
        program: "DTI",
      },
      {
        id: "m15",
        name: "Paul",
        initials: "P",
        email: "paul@example.com",
        program: "DTI",
      },
      {
        id: "m16",
        name: "Petar",
        initials: "P",
        email: "petar@example.com",
        program: "DTI",
      },
      {
        id: "m17",
        name: "Chris",
        initials: "C",
        email: "chris@example.com",
        program: "DTI",
      },
      {
        id: "m18",
        name: "Hanna",
        initials: "H",
        email: "hanna@example.com",
        program: "DTI",
      },
      {
        id: "m19",
        name: "Verena",
        initials: "V",
        email: "verena@example.com",
        program: "DTI",
      },
    ],
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g6",
    courseId: "c1",
    name: "Gruppe 3",
    description: "",
    maxMembers: 6,
    members: [
      {
        id: "m20",
        name: "Tamas",
        initials: "T",
        email: "tamas@example.com",
        program: "DTI",
      },
      {
        id: "m21",
        name: "Volha",
        initials: "V",
        email: "volha@example.com",
        program: "DTI",
      },
      {
        id: "m22",
        name: "Lisa",
        initials: "L",
        email: "lisa.ds@example.com",
        program: "DTI",
      },
      {
        id: "m23",
        name: "Katja",
        initials: "K",
        email: "katja@example.com",
        program: "DTI",
      },
      {
        id: "m24",
        name: "Sophie",
        initials: "S",
        email: "sophie@example.com",
        program: "DTI",
      },
      {
        id: "m25",
        name: "Tanja",
        initials: "T",
        email: "tanja@example.com",
        program: "DTI",
      },
    ],
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g7",
    courseId: "c1",
    name: "Gruppe 4",
    description: "",
    maxMembers: 7,
    members: [
      {
        id: "m26",
        name: "Öznur",
        initials: "Ö",
        email: "oznur@example.com",
        program: "DTI",
      },
      {
        id: "m1",
        name: "Markus",
        initials: "M",
        email: "markus.roe@example.com",
        program: "DTI",
      },
      {
        id: "m27",
        name: "Melanie",
        initials: "M",
        email: "melanie@example.com",
        program: "DTI",
      },
      {
        id: "m28",
        name: "Andreas",
        initials: "A",
        email: "andreas@example.com",
        program: "DTI",
      },
      {
        id: "m29",
        name: "Johannes",
        initials: "J",
        email: "johannes@example.com",
        program: "DTI",
      },
      {
        id: "m30",
        name: "Thomas",
        initials: "T",
        email: "thomas@example.com",
        program: "DTI",
      },
      {
        id: "m31",
        name: "Gökhan",
        initials: "G",
        email: "gokhan@example.com",
        program: "DTI",
      },
    ],
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g8",
    courseId: "c6",
    name: "Gruppe 1",
    description: "",
    maxMembers: 0,
    members: [
      {
        id: "m32",
        name: "Sarah",
        initials: "S",
        email: "sarah@example.com",
        program: "DI",
      },
      {
        id: "m33",
        name: "Janine",
        initials: "J",
        email: "janine@example.com",
        program: "DI",
      },
      {
        id: "m34",
        name: "Julia",
        initials: "J",
        email: "julia@example.com",
        program: "DI",
      },
    ],
    createdAt: new Date("2025-11-23"),
  },
  {
    id: "g9",
    courseId: "c6",
    name: "Gruppe 2",
    description: "",
    maxMembers: 0,
    members: [
      {
        id: "m35",
        name: "Yvonne",
        initials: "Y",
        email: "yvonne@example.com",
        program: "DI",
      },
      {
        id: "m36",
        name: "Selma",
        initials: "S",
        email: "selma@example.com",
        program: "DI",
      },
      {
        id: "m37",
        name: "Franziska",
        initials: "F",
        email: "franziska@example.com",
        program: "DI",
      },
    ],
    createdAt: new Date("2025-11-23"),
  },
  {
    id: "g10",
    courseId: "c6",
    name: "Gruppe 3",
    description: "",
    maxMembers: 0,
    members: [
      {
        id: "m38",
        name: "Vanessa",
        initials: "V",
        email: "vanessa@example.com",
        program: "DI",
      },
      {
        id: "m39",
        name: "Claudia",
        initials: "C",
        email: "claudia@example.com",
        program: "DI",
      },
      {
        id: "m40",
        name: "Samara",
        initials: "S",
        email: "samara@example.com",
        program: "DI",
      },
    ],
    createdAt: new Date("2025-11-23"),
  },
  {
    id: "g11",
    courseId: "c6",
    name: "Gruppe 4",
    description: "",
    maxMembers: 0,
    members: [
      {
        id: "m41",
        name: "Joshua",
        initials: "J",
        email: "joshua@example.com",
        program: "DTI",
      },
      {
        id: "m42",
        name: "Rainer",
        initials: "R",
        email: "rainer@example.com",
        program: "DTI",
      },
      {
        id: "m43",
        name: "Lorik",
        initials: "L",
        email: "lorik@example.com",
        program: "DTI",
      },
    ],
    createdAt: new Date("2025-11-23"),
  },
  {
    id: "g12",
    courseId: "c7",
    name: "Gruppe 5",
    description: "",
    maxMembers: 0,
    members: [
      {
        id: "m1",
        name: "Markus R.",
        initials: "MR",
        email: "markus.roe@gmx.net",
        program: "DTI",
      }
    ],
    createdAt: new Date("2025-11-23"),
  }
]

// Current user (mock)
export const currentUser = {
  id: "m1",
  name: "Markus R.",
  initials: "MR",
  email: "markus.roe@gmx.net",
  program: "DTI",
} as User;