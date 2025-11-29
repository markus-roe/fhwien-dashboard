import type {
  Session,
  CoachingSlot,
  Group,
  User,
  Course,
  Program,
} from "@/data/mockData";
import type { NextRequest } from "next/server";

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
// Sessions API Types
// ============================================================================

export interface CreateSessionRequest {
  courseId: string;
  type?: Session["type"];
  title: string;
  date: Date | string;
  time: string;
  endTime: string;
  location: string;
  locationType: Session["locationType"];
  attendance?: Session["attendance"];
  objectives?: string[];
  materials?: Session["materials"];
  groupId?: string;
}

export interface UpdateSessionRequest {
  courseId?: string;
  type?: Session["type"];
  title?: string;
  date?: Date | string;
  time?: string;
  endTime?: string;
  location?: string;
  locationType?: Session["locationType"];
  attendance?: Session["attendance"];
  objectives?: string[];
  materials?: Session["materials"];
  groupId?: string;
}

export interface GetSessionsQuery {
  courseId?: string;
}

export type SessionResponse = Session;
export type SessionsResponse = Session[];

// ============================================================================
// Coaching Slots API Types
// ============================================================================

export interface CreateCoachingSlotRequest {
  courseId: string;
  date: Date | string;
  time: string;
  endTime: string;
  maxParticipants: number;
  participants?: string[];
  description?: string;
}

export interface UpdateCoachingSlotRequest {
  courseId?: string;
  date?: Date | string;
  time?: string;
  endTime?: string;
  maxParticipants?: number;
  participants?: string[];
  description?: string;
}

export interface GetCoachingSlotsQuery {
  courseId?: string;
}

export type CoachingSlotResponse = CoachingSlot;
export type CoachingSlotsResponse = CoachingSlot[];

// ============================================================================
// Groups API Types
// ============================================================================

export interface CreateGroupRequest {
  courseId: string;
  name: string;
  description?: string;
  maxMembers?: number;
}

export interface UpdateGroupRequest {
  courseId?: string;
  name?: string;
  description?: string;
  maxMembers?: number;
  members?: string[];
}

export interface GetGroupsQuery {
  courseId?: string;
}

export type GroupResponse = Group;
export type GroupsResponse = Group[];

// ============================================================================
// Users API Types
// ============================================================================

export interface CreateUserRequest {
  name: string;
  email: string;
  program: Program;
  initials?: string;
  role?: User["role"];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  program?: Program;
  initials?: string;
  role?: User["role"];
}

export interface GetUsersQuery {
  program?: Program | "all";
  search?: string;
}

export type UserResponse = User;
export type UsersResponse = User[];

// ============================================================================
// Courses API Types
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
