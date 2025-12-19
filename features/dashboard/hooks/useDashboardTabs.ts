import { useSessions } from "@/features/sessions/hooks/useSessions";
import { useCoachingSlots } from "@/features/coaching/hooks/useCoachingSlots";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { useUsers } from "@/features/users/hooks/useUsers";

export function useDashboardTabs() {
  const { sessions: allSessions, loading: sessionsLoading } = useSessions();
  const { slots: allCoachingSlots, loading: slotsLoading } = useCoachingSlots();
  const { groups: allGroups, loading: groupsLoading } = useGroups();
  const { users: allUsers, loading: usersLoading } = useUsers();

  const isLoading =
    sessionsLoading || slotsLoading || groupsLoading || usersLoading;

  return {
    tabs: [
      {
        value: "lvs" as const,
        label: "Lehrveranstaltungen",
        badge: allSessions.length > 0 ? allSessions.length : undefined,
        loading: sessionsLoading,
      },
      {
        value: "coachings" as const,
        label: "Coachings",
        badge:
          allCoachingSlots.length > 0 ? allCoachingSlots.length : undefined,
        loading: slotsLoading,
      },
      {
        value: "groups" as const,
        label: "Gruppen",
        badge: allGroups.length > 0 ? allGroups.length : undefined,
        loading: groupsLoading,
      },
      {
        value: "users" as const,
        label: "Studenten",
        badge: allUsers.length > 0 ? allUsers.length : undefined,
        loading: usersLoading,
      },
    ],
    isLoading,
  };
}
