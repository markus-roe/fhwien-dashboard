export type Program = "DTI" | "DI";
export type SessionType = "lecture" | "workshop" | "coaching";
export type LocationType = "online" | "on-campus";

export interface Course {
  id: number;
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
  id: number;
  name: string;
  initials: string;
  email: string;
  program: Program;
  role?: UserRole;
}

export interface Group {
  id: number;
  courseId: number;
  name: string;
  description?: string;
  maxMembers?: number;
  members: User[];
  createdAt: Date;
}

export interface CoachingSlot {
  id: number;
  courseId: number;
  date: Date;
  time: string;
  endTime: string;
  duration: string;
  maxParticipants: number;
  participants: User[];
  description?: string;
  createdAt: Date;
}


export const currentUser = {
  id: 32,
  name: "Markus",
  initials: "MR",
  email: "markus.roe@gmx.net",
  program: "DTI",
  role: "student",
} as User;
