export type Program = "DTI" | "DI";
export type SessionType = "lecture" | "workshop" | "coaching";
export type LocationType = "online" | "on-campus";

export interface Course {
  id: string;
  title: string;
  subtitle: string;
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

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: "c1",
    title: "Data Science",
    subtitle: "Integrated Lecture",
    program: "DTI",
    module: "DTI Module 3",
  },
  {
    id: "c2",
    title: "Human-Technology Interaction",
    subtitle: "Integrated Lecture",
    program: "DTI",
    module: "DTI Module 4",
  },
  {
    id: "c3",
    title: "Innovation Design",
    subtitle: "Integrated Lecture",
    program: "DTI",
    module: "DTI Module 4",
  },
  {
    id: "c4",
    title: "Innovation Teams and Networks",
    subtitle: "Integrated Lecture",
    program: "DTI",
    module: "DTI Module 4",
  },
  {
    id: "c5",
    title: "Agile Software Engineering",
    subtitle: "Integrated Lecture",
    program: "DTI",
    module: "DTI Module 3",
  },
  {
    id: "c6",
    title: "Werkstatt",
    subtitle: "UE Workshop",
    program: "DTI",
    module: "DTI Module 1",
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
    id: "s23",
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
    id: "s30",
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
    id: "s31",
    courseId: "c1",
    type: "lecture",
    title: "Data Science IL",
    program: "DTI",
    module: "DTI Module 3",
    date: new Date("2025-11-22T08:30:00+01:00"),
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
      subtitle: "Designprinzipien und HTI-Beobachtungen",
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
      subtitle: "Designed for Whom?",
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
      subtitle: 'Projekt "Interaktionsdesign',
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
