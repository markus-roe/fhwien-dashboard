import { NextRequest, NextResponse } from "next/server";
import { mockGroups, currentUser, type Group } from "@/shared/data/mockData";
import type {
  CreateGroupRequest,
  GetGroupsQuery,
  GroupsResponse,
  GroupResponse,
  ApiError,
} from "@/shared/lib/api-types";

let groups: Group[] = [...mockGroups];

export async function GET(
  request: NextRequest
): Promise<NextResponse<GroupsResponse | ApiError>> {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");

  const query: GetGroupsQuery = {};
  if (courseId) {
    query.courseId = courseId;
  }

  let filteredGroups = groups;

  if (query.courseId) {
    filteredGroups = groups.filter((g) => g.courseId === query.courseId);
  }

  return NextResponse.json<GroupsResponse>(filteredGroups);
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<GroupResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateGroupRequest;
    const { courseId, name, description, maxMembers } = body;

    if (!courseId || !name) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newGroup: Group = {
      id: `g-${Date.now()}`,
      courseId,
      name,
      description,
      maxMembers,
      members: [currentUser.name],
      createdAt: new Date(),
    };

    groups.push(newGroup);

    return NextResponse.json<GroupResponse>(newGroup, { status: 201 });
  } catch (error) {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
