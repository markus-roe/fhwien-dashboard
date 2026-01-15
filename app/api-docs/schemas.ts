/**
 * This file contains OpenAPI schema definitions that can be referenced
 * in JSDoc comments using $ref: '#/components/schemas/SchemaName'
 *
 * Note: These schemas need to be added to the swagger spec definition
 * in app/api/openapi/route.ts to be available for reference.
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
      id: { type: "number", description: "User ID" },
      name: { type: "string", description: "User's full name" },
      email: { type: "string", format: "email", description: "User's email address" },
      program: { type: "string", enum: ["DTI", "DI"], description: "User's program" },
      initials: { type: "string", description: "User's initials" },
      role: { type: "string", enum: ["student", "professor", "admin"], description: "User's role" },
    },
    required: ["id", "name", "email", "program", "initials", "role"],
  },
  UserRef: {
    type: "object",
    properties: {
      name: { type: "string", description: "User's full name" },
      initials: { type: "string", description: "User's initials" },
    },
    required: ["name", "initials"],
  },
  CreateUserRequest: {
    type: "object",
    properties: {
      name: { type: "string", description: "User's full name" },
      email: { type: "string", format: "email", description: "User's email address" },
      program: { type: "string", enum: ["DTI", "DI"], description: "User's program" },
      initials: { type: "string", description: "User's initials (optional, auto-generated if not provided)" },
      role: { type: "string", enum: ["student", "professor", "admin"], description: "User's role (defaults to 'student')" },
    },
    required: ["name", "email", "program"],
  },
  UpdateUserRequest: {
    type: "object",
    properties: {
      name: { type: "string", description: "User's full name" },
      email: { type: "string", format: "email", description: "User's email address" },
      program: { type: "string", enum: ["DTI", "DI"], description: "User's program" },
      initials: { type: "string", description: "User's initials" },
      role: { type: "string", enum: ["student", "professor", "admin"], description: "User's role" },
    },
  },
  SessionResponse: {
    type: "object",
    properties: {
      id: { type: "number", description: "Session ID" },
      courseId: { type: "number", description: "Course ID" },
      type: { type: "string", enum: ["lecture", "workshop", "coaching"], description: "Session type" },
      title: { type: "string", description: "Session title" },
      date: { type: "string", format: "date-time", description: "Session date" },
      time: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "Start time (HH:mm format)" },
      endTime: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "End time (HH:mm format)" },
      duration: { type: "string", description: "Calculated duration" },
      location: { type: "string", description: "Session location" },
      locationType: { type: "string", enum: ["online", "on_campus"], description: "Location type" },
      lecturer: { $ref: "#/components/schemas/UserRef", description: "Session lecturer (optional)" },
      attendance: { type: "string", enum: ["mandatory", "optional"], description: "Attendance requirement" },
      objectives: { type: "array", items: { type: "string" }, description: "Learning objectives" },
      materials: { type: "array", items: { type: "object" }, description: "Session materials" },
      isLive: { type: "boolean", description: "Whether the session is live" },
      groupId: { type: "number", description: "Associated group ID (optional)" },
    },
    required: [
      "id",
      "courseId",
      "type",
      "title",
      "date",
      "time",
      "endTime",
      "duration",
      "location",
      "locationType",
      "attendance",
      "objectives",
    ],
  },
  CreateSessionRequest: {
    type: "object",
    properties: {
      courseId: { type: "number", description: "Course ID" },
      type: { type: "string", enum: ["lecture", "workshop", "coaching"], description: "Session type (defaults to 'lecture')" },
      title: { type: "string", description: "Session title" },
      date: { type: "string", format: "date-time", description: "Session date" },
      time: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "Start time (HH:mm format)" },
      endTime: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "End time (HH:mm format)" },
      location: { type: "string", description: "Session location" },
      locationType: { type: "string", enum: ["online", "on_campus"], description: "Location type" },
      attendance: { type: "string", enum: ["mandatory", "optional"], description: "Attendance requirement (defaults to 'mandatory')" },
      objectives: { type: "array", items: { type: "string" }, description: "Learning objectives" },
      groupId: { type: "number", description: "Associated group ID (optional)" },
    },
    required: ["courseId", "title", "date", "time", "endTime", "location", "locationType"],
  },
  UpdateSessionRequest: {
    type: "object",
    properties: {
      courseId: { type: "number", description: "Course ID" },
      type: { type: "string", enum: ["lecture", "workshop", "coaching"], description: "Session type" },
      title: { type: "string", description: "Session title" },
      date: { type: "string", format: "date-time", description: "Session date" },
      time: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "Start time (HH:mm format)" },
      endTime: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "End time (HH:mm format)" },
      location: { type: "string", description: "Session location" },
      locationType: { type: "string", enum: ["online", "on_campus"], description: "Location type" },
      attendance: { type: "string", enum: ["mandatory", "optional"], description: "Attendance requirement" },
      objectives: { type: "array", items: { type: "string" }, description: "Learning objectives" },
      groupId: { type: "number", description: "Associated group ID" },
    },
  },
  CoachingSlotResponse: {
    type: "object",
    properties: {
      id: { type: "number", description: "Coaching slot ID" },
      courseId: { type: "number", description: "Course ID" },
      date: { type: "string", format: "date-time", description: "Slot date" },
      time: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "Start time (HH:mm format)" },
      endTime: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "End time (HH:mm format)" },
      duration: { type: "string", description: "Calculated duration" },
      maxParticipants: { type: "number", description: "Maximum number of participants (0 = unlimited)" },
      participants: { type: "array", items: { $ref: "#/components/schemas/UserResponse" }, description: "List of participants" },
      description: { type: "string", description: "Slot description (optional)" },
      createdAt: { type: "string", format: "date-time", description: "Creation timestamp" },
    },
    required: ["id", "courseId", "date", "time", "endTime", "duration", "maxParticipants", "participants", "createdAt"],
  },
  CreateCoachingSlotRequest: {
    type: "object",
    properties: {
      courseId: { type: "number", description: "Course ID" },
      date: { type: "string", format: "date-time", description: "Slot date" },
      time: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "Start time (HH:mm format)" },
      endTime: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "End time (HH:mm format)" },
      maxParticipants: { type: "number", description: "Maximum number of participants (0 = unlimited)" },
      participants: { type: "array", items: { type: "number" }, description: "Array of user IDs to pre-book (optional)" },
      description: { type: "string", description: "Slot description (optional)" },
    },
    required: ["courseId", "date", "time", "endTime", "maxParticipants"],
  },
  UpdateCoachingSlotRequest: {
    type: "object",
    properties: {
      courseId: { type: "number", description: "Course ID" },
      date: { type: "string", format: "date-time", description: "Slot date" },
      time: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "Start time (HH:mm format)" },
      endTime: { type: "string", pattern: "^\\d{2}:\\d{2}$", description: "End time (HH:mm format)" },
      maxParticipants: { type: "number", description: "Maximum number of participants (0 = unlimited)" },
      participants: { type: "array", items: { type: "number" }, description: "Array of user IDs (replaces existing participants)" },
      description: { type: "string", description: "Slot description" },
    },
  },
  GroupResponse: {
    type: "object",
    properties: {
      id: { type: "number", description: "Group ID" },
      courseId: { type: "number", description: "Course ID" },
      name: { type: "string", description: "Group name" },
      description: { type: "string", description: "Group description (optional)" },
      maxMembers: { type: "number", description: "Maximum number of members (optional)" },
      members: { type: "array", items: { $ref: "#/components/schemas/UserResponse" }, description: "List of group members" },
      createdAt: { type: "string", format: "date-time", description: "Creation timestamp" },
    },
    required: ["id", "courseId", "name", "members", "createdAt"],
  },
  CreateGroupRequest: {
    type: "object",
    properties: {
      courseId: { type: "number", description: "Course ID" },
      name: { type: "string", description: "Group name" },
      description: { type: "string", description: "Group description (optional)" },
      maxMembers: { type: "number", description: "Maximum number of members (optional)" },
    },
    required: ["courseId", "name"],
  },
  UpdateGroupRequest: {
    type: "object",
    properties: {
      courseId: { type: "number", description: "Course ID" },
      name: { type: "string", description: "Group name" },
      description: { type: "string", description: "Group description" },
      maxMembers: { type: "number", description: "Maximum number of members" },
      members: { type: "array", items: { type: "number" }, description: "Array of user IDs (replaces existing members)" },
    },
  },
  CourseResponse: {
    type: "object",
    properties: {
      id: { type: "number", description: "Course ID" },
      title: { type: "string", description: "Course title" },
      program: { type: "array", items: { type: "string", enum: ["DTI", "DI"] }, description: "Programs this course belongs to" },
    },
    required: ["id", "title", "program"],
  },
};
