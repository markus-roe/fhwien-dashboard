import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import type {
  CreateUserRequest,
  GetUsersQuery,
  UsersResponse,
  UserResponse,
  ApiError,
} from "@/shared/lib/api-types";
import type { User } from "@/shared/data/mockData";

// kleine funktion um db user in api user umzuwandeln
function mapDbUserToApiUser(dbUser: {
  id: number;
  name: string;
  initials: string;
  email: string;
  program: string | null;
  role: string | null;
}): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    initials: dbUser.initials,
    email: dbUser.email,
    program: (dbUser.program as "DTI" | "DI") || "DTI",
    role: (dbUser.role as "student" | "professor") || "student",
  };
}

// get: alle user holen (kann auch suchen)
export async function GET(
  request: NextRequest
): Promise<NextResponse<UsersResponse | ApiError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get("program");
    const search = searchParams.get("search");

    const query: GetUsersQuery = {};
    if (program) {
      query.program = program as GetUsersQuery["program"];
    }
    if (search) {
      query.search = search;
    }

    // hier bauen wir die suchanfrage für prisma zusammen
    const where: any = {};

    // filter nach studiengang (außer wenn "all" ausgewählt ist)
    if (query.program && query.program !== "all") {
      where.program = query.program.toUpperCase();
    }

    // filter nach textsuche (name oder email)
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } }, // insensitive heißt groß/klein egal
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // datenbank abfragen
    const dbUsers = await prisma.user.findMany({
      where,
      orderBy: { name: "asc" }, // alphabetisch sortieren
    });

    // alle user umwandeln
    const filteredUsers = dbUsers.map(mapDbUserToApiUser);

    return NextResponse.json<UsersResponse>(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// post: neuen user erstellen
export async function POST(
  request: NextRequest
): Promise<NextResponse<UserResponse | ApiError>> {
  try {
    const body = (await request.json()) as CreateUserRequest;
    const { name, email, program, initials, role = "student" } = body;

    // prüfen ob alles da ist
    if (!name || !email || !program) {
      return NextResponse.json<ApiError>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // schauen ob es die email schon gibt
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json<ApiError>(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // user in datenbank schreiben
    const dbUser = await prisma.user.create({
      data: {
        name,
        email,
        program: program.toUpperCase() as "DTI" | "DI",
        // initialen automatisch generieren wenn keine da sind
        initials: initials || name.substring(0, 2).toUpperCase(),
        role: role.toLowerCase() as "student" | "professor",
      },
    });

    const newUser = mapDbUserToApiUser(dbUser);

    return NextResponse.json<UserResponse>(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
