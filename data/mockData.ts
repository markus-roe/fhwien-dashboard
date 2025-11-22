export type Program = "DTI" | "DI";
export type SessionType = "lecture" | "workshop" | "coaching";
export type LocationType = "online" | "on-campus";

export interface Course {
  id: string;
  title: string;
  program: Program;
  module: string;
}

export interface Session {
  id: string;
  courseId: string;
  type: SessionType;
  title: string;
  program: Program;
  module: string;
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

export interface ModuleProgress {
  percentage: number;
  semester: string;
  creditsEarned: number;
  creditsTotal: number;
}

export interface GroupMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  joinedAt: Date;
}

export interface Group {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  maxMembers?: number;
  members: GroupMember[];
  createdBy: string;
  createdAt: Date;
}

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: "c1",
    title: "Data Science",
    program: "DTI",
    module: "DTI Module 3",
  },
  {
    id: "c2",
    title: "Human-Technology Interaction",
    program: "DTI",
    module: "DTI Module 4",
  },
  {
    id: "c3",
    title: "Innovation Design",
    program: "DTI",
    module: "DTI Module 4",
  },
  {
    id: "c4",
    title: "Innovation Teams and Networks",
    program: "DTI",
    module: "DTI Module 4",
  },
  {
    id: "c5",
    title: "Agile Software Engineering",
    program: "DTI",
    module: "DTI Module 3",
  },
  {
    id: "c6",
    title: "Data Governance",
    program: "DTI",
    module: "DTI Module 1",
  },
  {
    id: "c7",
    title: "Cloud-based IT-Infrastructure",
    program: "DI",
    module: "DI Module 1",
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
    module: "DTI Module 4",
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
    module: "DTI Module 4",
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
    module: "DTI Module 4",
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
    module: "DTI Module 4",
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
    module: "DTI Module 4",
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
    module: "DTI Module 3",
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
    module: "DTI Module 1",
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
    module: "DTI Module 3",
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
    module: "DTI Module 3",
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
    module: "DTI Module 4",
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
    module: "DTI Module 3",
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
    module: "DTI Module 4",
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
    module: "DTI Module 3",
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
    module: "DTI Module 3",
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
    module: "DTI Module 4",
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
    module: "DTI Module 3",
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
    module: "DTI Module 4",
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
    module: "DTI Module 4",
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
    module: "DTI Module 4",
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
    module: "DTI Module 3",
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
    module: "DTI Module 1",
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
    module: "DTI Module 4",
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
    module: "DTI Module 4",
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
    module: "DTI Module 4",
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
    module: "DTI Module 4",
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
    module: "DTI Module 3",
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
    module: "DTI Module 3",
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
    module: "DTI Module 4",
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
    module: "DTI Module 3",
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
    module: "DTI Module 4",
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
    module: "DTI Module 4",
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
    module: "DTI Module 3",
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
    module: "DTI Module 3",
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
      module: "DTI Module 4",
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
      module: "DTI Module 4",
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
      module: "DTI Module 4",
    },
  },
];

// Mock Module Progress
export const mockModuleProgress: ModuleProgress = {
  percentage: 75,
  semester: "Semester 3",
  creditsEarned: 12,
  creditsTotal: 16,
};

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
    id: "g1",
    courseId: "c4",
    name: "Gruppe 1 - Innovation Teams",
    description: "Arbeitsgruppe für Projektarbeit",
    maxMembers: 5,
    members: [
      {
        id: "m1",
        name: "Markus R.",
        initials: "MR",
        email: "markus.roe@example.com",
        joinedAt: new Date("2025-09-20"),
      },
      {
        id: "m2",
        name: "Anna S.",
        initials: "AS",
        email: "anna.s@example.com",
        joinedAt: new Date("2025-09-21"),
      },
      {
        id: "m3",
        name: "Tom K.",
        initials: "TK",
        email: "tom.k@example.com",
        joinedAt: new Date("2025-09-22"),
      },
    ],
    createdBy: "m1",
    createdAt: new Date("2025-09-20"),
  },
  {
    id: "g2",
    courseId: "c4",
    name: "Gruppe 2 - Innovation Teams",
    description: "Alternative Gruppe",
    maxMembers: 6,
    members: [
      {
        id: "m4",
        name: "Lisa M.",
        initials: "LM",
        email: "lisa.m@example.com",
        joinedAt: new Date("2025-09-19"),
      },
      {
        id: "m5",
        name: "Max H.",
        initials: "MH",
        email: "max.h@example.com",
        joinedAt: new Date("2025-09-20"),
      },
    ],
    createdBy: "m4",
    createdAt: new Date("2025-09-19"),
  },
  {
    id: "g3",
    courseId: "c3",
    name: "Gruppe 3 - Innovation Design",
    description: "Für Innovation Design",
    maxMembers: 4,
    members: [
      {
        id: "m1",
        name: "Markus R.",
        initials: "MR",
        email: "markus.roe@example.com",
        joinedAt: new Date("2025-10-01"),
      },
    ],
    createdBy: "m1",
    createdAt: new Date("2025-10-01"),
  },
  {
    id: "g4",
    courseId: "c1",
    name: "Gruppe 1 - Data Science",
    description: "Für Data Science Projekte",
    maxMembers: 7,
    members: [
      {
        id: "m7",
        name: "Emanuel",
        initials: "E",
        email: "emanuel@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m8",
        name: "Bence",
        initials: "B",
        email: "bence@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m9",
        name: "Simon",
        initials: "S",
        email: "simon@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m10",
        name: "Alex",
        initials: "A",
        email: "alex@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m11",
        name: "Ozan",
        initials: "O",
        email: "ozan@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m12",
        name: "Natalia",
        initials: "N",
        email: "natalia@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m13",
        name: "Christoph",
        initials: "C",
        email: "christoph@example.com",
        joinedAt: new Date("2025-10-15"),
      },
    ],
    createdBy: "m7",
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g5",
    courseId: "c1",
    name: "Gruppe 2 - Data Science",
    description: "Für Data Science Projekte",
    maxMembers: 6,
    members: [
      {
        id: "m14",
        name: "Patrick",
        initials: "P",
        email: "patrick@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m15",
        name: "Paul",
        initials: "P",
        email: "paul@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m16",
        name: "Petar",
        initials: "P",
        email: "petar@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m17",
        name: "Chris",
        initials: "C",
        email: "chris@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m18",
        name: "Hanna",
        initials: "H",
        email: "hanna@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m19",
        name: "Verena",
        initials: "V",
        email: "verena@example.com",
        joinedAt: new Date("2025-10-15"),
      },
    ],
    createdBy: "m14",
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g6",
    courseId: "c1",
    name: "Gruppe 3 - Data Science",
    description: "Für Data Science Projekte",
    maxMembers: 6,
    members: [
      {
        id: "m20",
        name: "Tamas",
        initials: "T",
        email: "tamas@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m21",
        name: "Volha",
        initials: "V",
        email: "volha@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m22",
        name: "Lisa",
        initials: "L",
        email: "lisa.ds@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m23",
        name: "Katja",
        initials: "K",
        email: "katja@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m24",
        name: "Sophie",
        initials: "S",
        email: "sophie@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m25",
        name: "Tanja",
        initials: "T",
        email: "tanja@example.com",
        joinedAt: new Date("2025-10-15"),
      },
    ],
    createdBy: "m20",
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g7",
    courseId: "c1",
    name: "Gruppe 4 - Data Science",
    description: "Für Data Science Projekte",
    maxMembers: 7,
    members: [
      {
        id: "m26",
        name: "Öznur",
        initials: "Ö",
        email: "oznur@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m1",
        name: "Markus",
        initials: "M",
        email: "markus.roe@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m27",
        name: "Melanie",
        initials: "M",
        email: "melanie@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m28",
        name: "Andreas",
        initials: "A",
        email: "andreas@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m29",
        name: "Johannes",
        initials: "J",
        email: "johannes@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m30",
        name: "Thomas",
        initials: "T",
        email: "thomas@example.com",
        joinedAt: new Date("2025-10-15"),
      },
      {
        id: "m31",
        name: "Gökhan",
        initials: "G",
        email: "gokhan@example.com",
        joinedAt: new Date("2025-10-15"),
      },
    ],
    createdBy: "m26",
    createdAt: new Date("2025-10-15"),
  },
];

// Current user (mock)
export const currentUser = {
  id: "m1",
  name: "Markus R.",
  initials: "MR",
  email: "markus.roe@example.com",
};
