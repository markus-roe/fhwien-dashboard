import { useSession } from "next-auth/react";
import type { User } from "@/shared/lib/api-types";

export function useCurrentUser() {
    const { data: session, status } = useSession();

    const user: User | undefined = session?.user && session.user.program
        ? {
            id: parseInt(session.user.id),
            name: session.user.name,
            initials: session.user.initials || "",
            email: session.user.email || "",
            program: session.user.program,
            role: (session.user.role as "student" | "professor") || "student",
        }
        : undefined;

    return {
        user,
        loading: status === "loading",
        error: status === "unauthenticated" ? "Nicht angemeldet" : null,
        refetch: () => {}, // Session wird automatisch aktualisiert
    };
}
