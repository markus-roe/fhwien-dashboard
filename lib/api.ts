import type {
  CreateSessionRequest,
  UpdateSessionRequest,
  GetSessionsQuery,
  SessionResponse,
  SessionsResponse,
  CreateCoachingSlotRequest,
  UpdateCoachingSlotRequest,
  GetCoachingSlotsQuery,
  CoachingSlotResponse,
  CoachingSlotsResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  GetGroupsQuery,
  GroupResponse,
  GroupsResponse,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersQuery,
  UserResponse,
  UsersResponse,
  GetCoursesQuery,
  CoursesResponse,
  ApiSuccess,
} from "./api-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Sessions API
export const sessionsApi = {
  getAll: (query?: GetSessionsQuery): Promise<SessionsResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.courseId) searchParams.set("courseId", query.courseId);
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return apiRequest<SessionsResponse>(`/sessions${queryString}`);
  },

  getById: (id: string): Promise<SessionResponse> => {
    return apiRequest<SessionResponse>(`/sessions/${id}`);
  },

  create: (data: CreateSessionRequest): Promise<SessionResponse> => {
    return apiRequest<SessionResponse>("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (
    id: string,
    data: UpdateSessionRequest
  ): Promise<SessionResponse> => {
    return apiRequest<SessionResponse>(`/sessions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<ApiSuccess> => {
    return apiRequest<ApiSuccess>(`/sessions/${id}`, {
      method: "DELETE",
    });
  },
};

// Coaching Slots API
export const coachingSlotsApi = {
  getAll: (query?: GetCoachingSlotsQuery): Promise<CoachingSlotsResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.courseId) searchParams.set("courseId", query.courseId);
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return apiRequest<CoachingSlotsResponse>(`/coaching-slots${queryString}`);
  },

  getById: (id: string): Promise<CoachingSlotResponse> => {
    return apiRequest<CoachingSlotResponse>(`/coaching-slots/${id}`);
  },

  create: (data: CreateCoachingSlotRequest): Promise<CoachingSlotResponse> => {
    return apiRequest<CoachingSlotResponse>("/coaching-slots", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (
    id: string,
    data: UpdateCoachingSlotRequest
  ): Promise<CoachingSlotResponse> => {
    return apiRequest<CoachingSlotResponse>(`/coaching-slots/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<ApiSuccess> => {
    return apiRequest<ApiSuccess>(`/coaching-slots/${id}`, {
      method: "DELETE",
    });
  },

  book: (id: string): Promise<CoachingSlotResponse> => {
    return apiRequest<CoachingSlotResponse>(`/coaching-slots/${id}/book`, {
      method: "POST",
    });
  },

  cancel: (id: string): Promise<CoachingSlotResponse> => {
    return apiRequest<CoachingSlotResponse>(`/coaching-slots/${id}/cancel`, {
      method: "POST",
    });
  },
};

// Groups API
export const groupsApi = {
  getAll: (query?: GetGroupsQuery): Promise<GroupsResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.courseId) searchParams.set("courseId", query.courseId);
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return apiRequest<GroupsResponse>(`/groups${queryString}`);
  },

  getById: (id: string): Promise<GroupResponse> => {
    return apiRequest<GroupResponse>(`/groups/${id}`);
  },

  create: (data: CreateGroupRequest): Promise<GroupResponse> => {
    return apiRequest<GroupResponse>("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: UpdateGroupRequest): Promise<GroupResponse> => {
    return apiRequest<GroupResponse>(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<ApiSuccess> => {
    return apiRequest<ApiSuccess>(`/groups/${id}`, {
      method: "DELETE",
    });
  },

  join: (id: string): Promise<GroupResponse> => {
    return apiRequest<GroupResponse>(`/groups/${id}/join`, {
      method: "POST",
    });
  },

  leave: (id: string): Promise<GroupResponse> => {
    return apiRequest<GroupResponse>(`/groups/${id}/leave`, {
      method: "POST",
    });
  },
};

// Users API
export const usersApi = {
  getAll: (query?: GetUsersQuery): Promise<UsersResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.program) searchParams.set("program", query.program);
    if (query?.search) searchParams.set("search", query.search);
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return apiRequest<UsersResponse>(`/users${queryString}`);
  },

  getById: (id: string): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/users/${id}`);
  },

  create: (data: CreateUserRequest): Promise<UserResponse> => {
    return apiRequest<UserResponse>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: UpdateUserRequest): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (id: string): Promise<ApiSuccess> => {
    return apiRequest<ApiSuccess>(`/users/${id}`, {
      method: "DELETE",
    });
  },
};

// Courses API
export const coursesApi = {
  getAll: (query?: GetCoursesQuery): Promise<CoursesResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.program) searchParams.set("program", query.program);
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return apiRequest<CoursesResponse>(`/courses${queryString}`);
  },
};

// Current User API
export const currentUserApi = {
  get: (): Promise<UserResponse> => {
    return apiRequest<UserResponse>("/current-user");
  },
};
