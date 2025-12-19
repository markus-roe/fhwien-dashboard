/**
 * This file contains OpenAPI schema definitions that can be referenced
 * in JSDoc comments using $ref: '#/components/schemas/SchemaName'
 *
 * Note: These schemas need to be added to the swagger spec definition
 * in app/api-docs/route.ts to be available for reference.
 */

export const commonSchemas = {
  ApiError: {
    type: "object",
    properties: {
      error: {
        type: "string",
        description: "Error message",
      },
    },
    required: ["error"],
  },
  ApiSuccess: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        description: "Success status",
      },
    },
    required: ["success"],
  },
  UserResponse: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
      program: { type: "string" },
      initials: { type: "string" },
      role: { type: "string", enum: ["student", "teacher", "admin"] },
    },
    required: ["id", "name", "email", "program"],
  },
  CreateUserRequest: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      program: { type: "string" },
      initials: { type: "string" },
      role: { type: "string", enum: ["student", "teacher", "admin"] },
    },
    required: ["name", "email", "program"],
  },
  SessionResponse: {
    type: "object",
    properties: {
      id: { type: "string" },
      courseId: { type: "string" },
      type: { type: "string", enum: ["lecture", "exercise", "lab"] },
      title: { type: "string" },
      date: { type: "string", format: "date-time" },
      time: { type: "string" },
      endTime: { type: "string" },
      location: { type: "string" },
      locationType: { type: "string", enum: ["online", "on-site"] },
      attendance: { type: "string", enum: ["mandatory", "optional"] },
      objectives: { type: "array", items: { type: "string" } },
      materials: { type: "array", items: { type: "object" } },
      groupId: { type: "string" },
    },
    required: [
      "id",
      "courseId",
      "title",
      "date",
      "time",
      "endTime",
      "location",
    ],
  },
  CreateSessionRequest: {
    type: "object",
    properties: {
      courseId: { type: "string" },
      type: { type: "string", enum: ["lecture", "exercise", "lab"] },
      title: { type: "string" },
      date: { type: "string", format: "date-time" },
      time: { type: "string" },
      endTime: { type: "string" },
      location: { type: "string" },
      locationType: { type: "string", enum: ["online", "on-site"] },
      attendance: { type: "string", enum: ["mandatory", "optional"] },
      objectives: { type: "array", items: { type: "string" } },
      materials: { type: "array", items: { type: "object" } },
      groupId: { type: "string" },
    },
    required: ["courseId", "title", "date", "time", "endTime", "location"],
  },
  CoachingSlotResponse: {
    type: "object",
    properties: {
      id: { type: "string" },
      courseId: { type: "string" },
      date: { type: "string", format: "date-time" },
      time: { type: "string" },
      endTime: { type: "string" },
      maxParticipants: { type: "number" },
      participants: { type: "array", items: { type: "string" } },
      description: { type: "string" },
    },
    required: ["id", "courseId", "date", "time", "endTime", "maxParticipants"],
  },
  UpdateSessionRequest: {
    type: "object",
    properties: {
      courseId: { type: "string" },
      type: { type: "string", enum: ["lecture", "exercise", "lab"] },
      title: { type: "string" },
      date: { type: "string", format: "date-time" },
      time: { type: "string" },
      endTime: { type: "string" },
      location: { type: "string" },
      locationType: { type: "string", enum: ["online", "on-site"] },
      attendance: { type: "string", enum: ["mandatory", "optional"] },
      objectives: { type: "array", items: { type: "string" } },
      materials: { type: "array", items: { type: "object" } },
      groupId: { type: "string" },
    },
  },
  CreateCoachingSlotRequest: {
    type: "object",
    properties: {
      courseId: { type: "string" },
      date: { type: "string", format: "date-time" },
      time: { type: "string" },
      endTime: { type: "string" },
      maxParticipants: { type: "number" },
      participants: { type: "array", items: { type: "string" } },
      description: { type: "string" },
    },
    required: ["courseId", "date", "time", "endTime", "maxParticipants"],
  },
  UpdateCoachingSlotRequest: {
    type: "object",
    properties: {
      courseId: { type: "string" },
      date: { type: "string", format: "date-time" },
      time: { type: "string" },
      endTime: { type: "string" },
      maxParticipants: { type: "number" },
      participants: { type: "array", items: { type: "string" } },
      description: { type: "string" },
    },
  },
  CreateGroupRequest: {
    type: "object",
    properties: {
      courseId: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      maxMembers: { type: "number" },
    },
    required: ["courseId", "name"],
  },
  UpdateGroupRequest: {
    type: "object",
    properties: {
      courseId: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      maxMembers: { type: "number" },
      members: { type: "array", items: { type: "string" } },
    },
  },
  UpdateUserRequest: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      program: { type: "string" },
      initials: { type: "string" },
      role: { type: "string", enum: ["student", "teacher", "admin"] },
    },
  },
  CourseResponse: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      code: { type: "string" },
      program: { type: "array", items: { type: "string" } },
      description: { type: "string" },
    },
    required: ["id", "name", "code"],
  },
  GroupResponse: {
    type: "object",
    properties: {
      id: { type: "string" },
      courseId: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      maxMembers: { type: "number" },
      members: { type: "array", items: { type: "string" } },
    },
    required: ["id", "courseId", "name"],
  },
};
