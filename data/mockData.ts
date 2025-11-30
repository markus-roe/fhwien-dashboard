export type Program = "DTI" | "DI";
export type SessionType = "lecture" | "workshop" | "coaching";
export type LocationType = "online" | "on-campus";

export interface Course {
  id: string;
  title: string;
  program: Program[];
}

export interface Professor {
  name: string;
  initials: string;
  email: string;
}

export interface Session {
  id: string;
  courseId: string;
  type: SessionType;
  title: string;
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
  groupId?: string;
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

export type UserRole = "student" | "professor";

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  program: Program;
  role?: UserRole;
}

export interface Group {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  maxMembers?: number;
  members: string[];
  createdAt: Date;
}

export interface CoachingSlot {
  id: string;
  courseId: string;
  date: Date;
  time: string;
  endTime: string;
  duration: string;
  maxParticipants: number;
  participants: string[];
  description?: string;
  createdAt: Date;
}

export const mockProfessors: Professor[] = [
  {
    name: "Manfred Bornemann",
    initials: "MB",
    email: "manfred.bornemann@fhwien.ac.at",
  },
  {
    name: "Doro Erharter",
    initials: "DE",
    email: "doroxxx@fhwien.ac.at",
  },
  {
    name: "Tilia Stingl",
    initials: "TS",
    email: "tilia@fhwien.ac.at",
  },
  {
    name: "Sebastian Eschenbach",
    initials: "SE",
    email: "sebastian.eschenbach@fhwien.ac.at",
  },
  {
    name: "Elka Xharo",
    initials: "EX",
    email: "elka@fhwien.ac.at",
  },
  {
    name: "Jackie Klaura",
    initials: "JK",
    email: "jackie@fhwien.ac.at",
  },
  {
    name: "Barbara Kainz",
    initials: "BK",
    email: "barbara@fhwien.ac.at",
  },
  {
    name: "Leo Weber",
    initials: "LW",
    email: "leo@fhwien.ac.at",
  },
  {
    name: "Paul Schmidinger",
    initials: "P",
    email: "paul@fhwien.ac.at",
  },
  {
    name: "Renè",
    initials: "R",
    email: "rene@fhwien.ac.at",
  },
];

export const mockCourses: Course[] = [
  {
    id: "ds",
    title: "Data Science",
    program: ["DTI"],
  },
  {
    id: "hti",
    title: "Human-Technology Interaction",
    program: ["DTI"],
  },
  {
    id: "inno",
    title: "Innovation Design",
    program: ["DTI", "DI"],
  },
  {
    id: "networks",
    title: "Innovation Teams and Networks",
    program: ["DTI", "DI"],
  },
  {
    id: "software",
    title: "Agile Software Engineering",
    program: ["DTI", "DI"],
  },
  {
    id: "dg",
    title: "Data Governance",
    program: ["DI"],
  },
  {
    id: "c7",
    title: "Cloud-based IT-Infrastructure",
    program: ["DI"],
  },
];

export const mockSessions: Session[] = [
  {
    id: "s1",
    courseId: "networks",
    type: "lecture",
    title: "Innovation Teams and Networks IL",
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
    courseId: "inno",
    type: "lecture",
    title: "Innovation Design IL",
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
    courseId: "networks",
    type: "lecture",
    title: "Innovation Teams and Networks IL",
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
    courseId: "hti",
    type: "lecture",
    title: "Einstieg in Human Technology Interaction",
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
    courseId: "inno",
    type: "lecture",
    title: "Innovation Design IL",
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
    courseId: "ds",
    type: "lecture",
    title: "Data Science IL",
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
    courseId: "software",
    type: "workshop",
    title: "Werkstatt UE",
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
    courseId: "ds",
    type: "lecture",
    title: "Einführung Datenmodellierungssoftware",
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
    courseId: "software",
    type: "lecture",
    title: "Software Intro",
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
    id: "s12",
    courseId: "hti",
    type: "lecture",
    title: "Human-Technology-Interaction IL",
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
    courseId: "ds",
    type: "lecture",
    title: "Data Science IL",
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
    courseId: "software",
    type: "lecture",
    title: "Agile Software Engineering IL",
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
    courseId: "inno",
    type: "lecture",
    title: "Innovation Design IL",
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
    courseId: "ds",
    type: "lecture",
    title: "Data Science IL",
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
    courseId: "inno",
    type: "lecture",
    title: "Innovation Design IL",
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
    courseId: "hti",
    type: "lecture",
    title: "Human-Technology-Interaction IL",
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
    courseId: "hti",
    type: "lecture",
    title: "Human-Technology-Interaction IL",
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
    courseId: "ds",
    type: "lecture",
    title: "Data Science IL",
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
    courseId: "software",
    type: "workshop",
    title: "Werkstatt UE",
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
    courseId: "inno",
    type: "lecture",
    title: "Strategic Fit and Timing",
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
    courseId: "networks",
    type: "lecture",
    title: "Schlussveranstaltung Netzwerken - Lessons Learned",
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
    courseId: "inno",
    type: "lecture",
    title: "Ziele, Zielgruppen, Personas",
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
    courseId: "inno",
    type: "lecture",
    title: "Gendered Design 1",
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
    courseId: "software",
    type: "lecture",
    title: "Agile Software Engineering IL",
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
    courseId: "software",
    type: "lecture",
    title: "Agile Software Engineering IL",
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
    id: "s34",
    courseId: "hti",
    type: "lecture",
    title: "Human-Technology-Interaction IL",
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
    courseId: "networks",
    type: "lecture",
    title: "Innovation Teams and Networks IL",
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
    courseId: "software",
    type: "lecture",
    title: "Agile Software Engineering IL",
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

export const mockGroups: Group[] = [
  {
    id: "g4",
    courseId: "ds",
    name: "Gruppe 1",
    description: "",
    maxMembers: 7,
    members: [
      "Emanuel",
      "Bence",
      "Simon",
      "Alex",
      "Ozan",
      "Natalia",
      "Christoph",
    ],
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g5",
    courseId: "ds",
    name: "Gruppe 2",
    description: "",
    maxMembers: 6,
    members: ["Patrick", "Paul", "Petar", "Chris", "Hanna", "Verena"],
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g6",
    courseId: "ds",
    name: "Gruppe 3",
    description: "",
    maxMembers: 6,
    members: ["Tamas", "Volha", "Lisa", "Katja", "Sophie", "Tanja"],
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g7",
    courseId: "ds",
    name: "Gruppe 4",
    description: "",
    maxMembers: 7,
    members: [
      "Öznur",
      "Markus",
      "Melanie",
      "Andreas",
      "Johannes",
      "Thomas",
      "Gökhan",
    ],
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "g8",
    courseId: "software",
    name: "Gruppe 1",
    description: "",
    maxMembers: 4,
    members: ["Öznur", "Markus", "Melanie", "Johannes"],
    createdAt: new Date("2025-10-15"),
  },
];

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Markus",
    initials: "MR",
    email: "markus.roe@gmx.net",
    program: "DTI",
    role: "student",
  },
  {
    id: "u2",
    name: "Emanuel",
    initials: "EM",
    email: "emanuel@fhwien.ac.at",
    program: "DTI",
    role: "student",
  },
  {
    id: "u3",
    name: "Bence",
    initials: "BE",
    email: "bence@fhwien.ac.at",
    program: "DTI",
    role: "student",
  },
  {
    id: "u4",
    name: "Natalia",
    initials: "NA",
    email: "natalia@fhwien.ac.at",
    program: "DI",
    role: "student",
  },
  {
    id: "u5",
    name: "Christoph",
    initials: "CH",
    email: "christoph@fhwien.ac.at",
    program: "DTI",
    role: "student",
  },
  {
    id: "u6",
    name: "Hanna",
    initials: "HA",
    email: "hanna@fhwien.ac.at",
    program: "DI",
    role: "student",
  },
  {
    id: "u7",
    name: "Verena",
    initials: "VE",
    email: "verena@fhwien.ac.at",
    program: "DTI",
    role: "student",
  },
  {
    id: "u8",
    name: "Andreas",
    initials: "AN",
    email: "andreas@fhwien.ac.at",
    program: "DTI",
    role: "student",
  },
  {
    id: "u9",
    name: "Johannes",
    initials: "JO",
    email: "johannes@fhwien.ac.at",
    program: "DI",
    role: "student",
  },
  {
    id: "u10",
    name: "Lisa",
    initials: "LI",
    email: "lisa@fhwien.ac.at",
    program: "DTI",
    role: "student",
  },
];

export const currentUser = {
  id: "m1",
  name: "Markus",
  initials: "MR",
  email: "markus.roe@gmx.net",
  program: "DTI",
  role: "student",
} as User;

export const mockCoachingSlots: CoachingSlot[] = [
  {
    id: "cs2",
    courseId: "ds",
    date: new Date("2025-12-01T21:00:00+01:00"),
    time: "21:00",
    endTime: "21:45",
    duration: "45m",
    maxParticipants: 4,
    participants: ["Bence"],
    description: "222 Coaching für Data Science Fragen",
    createdAt: new Date("2025-11-01"),
  },
  {
    id: "cs3",
    courseId: "ds",
    date: new Date("2025-10-02T21:00:00+01:00"),
    time: "21:00",
    endTime: "21:45",
    duration: "45m",
    maxParticipants: 4,
    participants: ["Natalie"],
    description: "333 Coaching für Data Science Fragen",
    createdAt: new Date("2025-11-01"),
  },
  {
    id: "cs4",
    courseId: "ds",
    date: new Date("2025-12-23T21:00:00+01:00"),
    time: "21:00",
    endTime: "21:45",
    duration: "45m",
    maxParticipants: 4,
    participants: ["Natalie"],
    description: "333 Coaching für Data Science Fragen",
    createdAt: new Date("2025-11-01"),
  },
  {
    id: "cs5",
    courseId: "ds",
    date: new Date("2025-12-02T21:00:00+01:00"),
    time: "21:00",
    endTime: "21:45",
    duration: "45m",
    maxParticipants: 7,
    participants: [
      "Markus",
      "Johannes",
      "Melanie",
      "Thomas",
      "Andreas",
      "Öznur",
      "Gökhan",
    ],
    description: "333 Coaching für Data Science Fragen",
    createdAt: new Date("2025-11-01"),
  },
];
