import type {
  CreateSessionRequest,
  UpdateSessionRequest,
  GetSessionsQuery,
  SessionResponse,
  SessionsResponse,
  CreateCoachingSlotRequest,
  UpdateCoachingSlotRequest,
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
  CoachingSlot,
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
  getAll: (): Promise<SessionsResponse> => {
    return apiRequest<SessionsResponse>(`/sessions`);
  },

  getById: (id: number): Promise<SessionResponse> => {
    return apiRequest<SessionResponse>(`/sessions/${id}`);
  },

  create: (data: CreateSessionRequest): Promise<SessionResponse> => {
    return apiRequest<SessionResponse>("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (
    id: number,
    data: UpdateSessionRequest
  ): Promise<SessionResponse> => {
    return apiRequest<SessionResponse>(`/sessions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (id: number): Promise<ApiSuccess> => {
    return apiRequest<ApiSuccess>(`/sessions/${id.toString(10)}`, { method: "DELETE" });
  },
};

// Coaching Slots API
export const coachingSlotsApi = {
  getAll: (): Promise<CoachingSlot[]> => {
    return apiRequest<CoachingSlot[]>(`/coaching-slots`);
  },

  getById: (id: number): Promise<CoachingSlot> => {
    return apiRequest<CoachingSlot>(`/coaching-slots/${id}`);
  },

  create: (data: CreateCoachingSlotRequest): Promise<CoachingSlot> => {
    return apiRequest<CoachingSlot>("/coaching-slots", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (
    id: number,
    data: UpdateCoachingSlotRequest
  ): Promise<CoachingSlot> => {
    return apiRequest<CoachingSlot>(`/coaching-slots/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (id: number): Promise<ApiSuccess> => {
    return apiRequest<ApiSuccess>(`/coaching-slots/${id}`, {
      method: "DELETE",
    });
  },

  book: (id: number, userId: number): Promise<CoachingSlot> => {
    return apiRequest<CoachingSlot>(`/coaching-slots/${id}/book`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  cancel: (id: number, userId: number): Promise<CoachingSlot> => {
    return apiRequest<CoachingSlot>(`/coaching-slots/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },
};

// Groups API
export const groupsApi = {
  getAll: (query?: GetGroupsQuery): Promise<GroupsResponse> => {
    const searchParams = new URLSearchParams();
    if (query?.courseId) searchParams.set("courseId", query.courseId.toString());
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    return apiRequest<GroupsResponse>(`/groups${queryString}`);
  },

  getById: (id: number): Promise<GroupResponse> => {
    return apiRequest<GroupResponse>(`/groups/${id}`);
  },

  create: (data: CreateGroupRequest): Promise<GroupResponse> => {
    return apiRequest<GroupResponse>("/groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (id: number, data: UpdateGroupRequest): Promise<GroupResponse> => {
    return apiRequest<GroupResponse>(`/groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (id: number): Promise<ApiSuccess> => {
    return apiRequest<ApiSuccess>(`/groups/${id}`, {
      method: "DELETE",
    });
  },

  join: (id: number, userId: number): Promise<GroupResponse> => {
    return apiRequest<GroupResponse>(`/groups/${id}/join`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  leave: (id: number, userId: number): Promise<GroupResponse> => {
    return apiRequest<GroupResponse>(`/groups/${id}/leave`, {
      method: "POST",
      body: JSON.stringify({ userId }),
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

  getById: (id: number): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/users/${id}`);
  },

  create: (data: CreateUserRequest): Promise<UserResponse> => {
    return apiRequest<UserResponse>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: (id: number, data: UpdateUserRequest): Promise<UserResponse> => {
    return apiRequest<UserResponse>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: (id: number): Promise<ApiSuccess> => {
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

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiSuccess> => {
    return apiRequest<ApiSuccess>("/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
