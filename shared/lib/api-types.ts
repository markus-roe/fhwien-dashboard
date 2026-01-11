import type { NextRequest } from "next/server";

// ============================================================================
// Enums - matching Prisma schema
// ============================================================================

export type Program = "DTI" | "DI";
export type SessionType = "lecture" | "workshop" | "coaching";
export type LocationType = "online" | "on_campus";
export type UserRole = "student" | "professor";
export type Attendance = "mandatory" | "optional";
export type MaterialType = "pdf" | "presentation" | "other";

// ============================================================================
// Common Types
// ============================================================================

export interface ApiError {
  error: string;
}

export interface ApiSuccess {
  success: boolean;
}

// ============================================================================
// User Types
// ============================================================================

/** User as returned by the API */
export interface User {
  id: number;
  name: string;
  initials: string;
  email: string;
  program: Program;
  role: UserRole;
}

/** Simplified user reference (for lecturer, participant displays) */
export interface UserRef {
  name: string;
  initials: string;
}

// ============================================================================
// Course Types
// ============================================================================

/** Course as returned by the API */
export interface Course {
  id: number;
  title: string;
  program: Program[];
}

// ============================================================================
// Session Types
// ============================================================================

/** Material attached to a session */
export interface Material {
  id: string;
  name: string;
  size: string;
  addedDate: string;
  type: MaterialType;
}

/** Session as returned by the API */
export interface Session {
  id: number;
  courseId: number;
  type: SessionType;
  title: string;
  date: Date | string;
  time: string;
  endTime: string;
  duration: string;
  location: string;
  locationType: LocationType;
  lecturer?: UserRef;
  attendance: Attendance;
  objectives: string[];
  materials: Material[];
  participants?: number;
  isLive?: boolean;
  groupId?: number;
}

// ============================================================================
// Coaching Slot Types
// ============================================================================

/** CoachingSlot as returned by the API */
export interface CoachingSlot {
  id: number;
  courseId: number;
  date: Date | string;
  time: string;
  endTime: string;
  duration: string;
  maxParticipants: number;
  participants: User[]; // Full User objects for participants
  description?: string;
  createdAt: Date | string;
}

// ============================================================================
// Group Types
// ============================================================================

/** Group as returned by the API */
export interface Group {
  id: number;
  courseId: number;
  name: string;
  description?: string;
  maxMembers?: number;
  members: User[]; // Full User objects for members
  createdAt: Date | string;
}

// ============================================================================
// Task Types
// ============================================================================

/** Task as returned by the API */
export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed?: boolean;
  course: Course;
}

// ============================================================================
// Sessions API Request/Response Types
// ============================================================================

export interface CreateSessionRequest {
  courseId: number;
  type?: SessionType;
  title: string;
  date: Date | string;
  time: string;
  endTime: string;
  location: string;
  locationType: LocationType;
  attendance?: Attendance;
  objectives?: string[];
  materials?: Material[];
  groupId?: number;
}

export interface UpdateSessionRequest {
  courseId?: number;
  type?: SessionType;
  title?: string;
  date?: Date | string;
  time?: string;
  endTime?: string;
  location?: string;
  locationType?: LocationType;
  attendance?: Attendance;
  objectives?: string[];
  materials?: Material[];
  groupId?: number;
}

export interface GetSessionsQuery {
  courseId?: number;
}

export type SessionResponse = Session;
export type SessionsResponse = Session[];

// ============================================================================
// Coaching Slots API Request/Response Types
// ============================================================================

export interface CreateCoachingSlotRequest {
  courseId: number;
  date: Date | string;
  time: string;
  endTime: string;
  maxParticipants: number;
  participants?: { id: number }[]; // Array of user IDs
  description?: string;
}

export interface UpdateCoachingSlotRequest {
  courseId?: number;
  date?: Date | string;
  time?: string;
  endTime?: string;
  maxParticipants?: number;
  participants?: { id: number }[]; // Array of user IDs
  description?: string;
}

// ============================================================================
// Groups API Request/Response Types
// ============================================================================

export interface CreateGroupRequest {
  courseId: number;
  name: string;
  description?: string;
  maxMembers?: number;
}

export interface UpdateGroupRequest {
  courseId?: number;
  name?: string;
  description?: string;
  maxMembers?: number;
  members?: number[]; // Array of user IDs
}

export interface GetGroupsQuery {
  courseId?: number;
}

export type GroupResponse = Group;
export type GroupsResponse = Group[];

// ============================================================================
// Users API Request/Response Types
// ============================================================================

export interface CreateUserRequest {
  name: string;
  email: string;
  program: Program;
  initials?: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  program?: Program;
  initials?: string;
  role?: UserRole;
}

export interface GetUsersQuery {
  program?: Program | "all";
  search?: string;
}

export type UserResponse = User;
export type UsersResponse = User[];

// ============================================================================
// Courses API Request/Response Types
// ============================================================================

export interface GetCoursesQuery {
  program?: Program;
}

export type CourseResponse = Course;
export type CoursesResponse = Course[];

// ============================================================================
// Route Handler Context Types (Next.js 14)
// ============================================================================

export interface RouteContext<
  T extends Record<string, string> = Record<string, string>
> {
  params: T;
}

export interface RouteHandlerParams {
  request: NextRequest;
}

export interface RouteHandlerParamsWithId extends RouteHandlerParams {
  context: RouteContext<{ id: string }>;
}

export type { NextRequest } from "next/server";
