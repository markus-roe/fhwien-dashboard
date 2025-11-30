import { useSessions } from "./useSessions";
import { useCoachingSlots } from "./useCoachingSlots";
import { useGroups } from "./useGroups";
import { useUsers } from "./useUsers";

export function useDashboardTabs() {
  const { sessions: allSessions } = useSessions();
  const { slots: allCoachingSlots } = useCoachingSlots();
  const { groups: allGroups } = useGroups();
  const { users: allUsers } = useUsers();

  return [
    {
      value: "lvs" as const,
      label: "Lehrveranstaltungen",
      badge: allSessions.length > 0 ? allSessions.length : undefined,
    },
    {
      value: "coachings" as const,
      label: "Coachings",
      badge: allCoachingSlots.length > 0 ? allCoachingSlots.length : undefined,
    },
    {
      value: "groups" as const,
      label: "Gruppen",
      badge: allGroups.length > 0 ? allGroups.length : undefined,
    },
    {
      value: "users" as const,
      label: "Studenten",
      badge: allUsers.length > 0 ? allUsers.length : undefined,
    },
  ];
}
