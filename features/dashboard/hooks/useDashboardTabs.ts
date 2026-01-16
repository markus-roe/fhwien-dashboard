import { useSessions } from "@/features/sessions/hooks/useSessions";
import { useCoachingSlots } from "@/features/coaching/hooks/useCoachingSlots";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useReports } from "@/features/reports/hooks/useReports";
import type { SegmentedTabOption } from "@/shared/components/ui/SegmentedTabs";

export function useDashboardTabs() {
  const { user: currentUser } = useCurrentUser();
  const { sessions: allSessions, loading: sessionsLoading } = useSessions();
  const { slots: allCoachingSlots, loading: slotsLoading } = useCoachingSlots();
  const { groups: allGroups, loading: groupsLoading } = useGroups();
  const { users: allUsers, loading: usersLoading } = useUsers();
  const { data: reports, isLoading: reportsLoading } = useReports();

  const isLoading =
    sessionsLoading || slotsLoading || groupsLoading || usersLoading;

  const baseTabs: SegmentedTabOption[] = [
    {
      value: "lvs",
      label: "Lehrveranstaltungen",
      badge: allSessions.length > 0 ? allSessions.length : undefined,
      loading: sessionsLoading,
    },
    {
      value: "coachings",
      label: "Coachings",
      badge:
        allCoachingSlots.length > 0 ? allCoachingSlots.length : undefined,
      loading: slotsLoading,
    },
    {
      value: "groups",
      label: "Gruppen",
      badge: allGroups.length > 0 ? allGroups.length : undefined,
      loading: groupsLoading,
    },
    {
      value: "users",
      label: "Studenten",
      badge: allUsers.length > 0 ? allUsers.length : undefined,
      loading: usersLoading,
    },
  ];

  // Only show reports tab for user with ID 32
  if (currentUser?.id === 32) {
    const openReportsCount = reports?.filter((r) => r.status === "open").length || 0;
    const reportsTab: SegmentedTabOption = {
      value: "reports",
      label: "Reports",
      badge: openReportsCount > 0 ? openReportsCount : undefined,
      loading: reportsLoading,
    };
    baseTabs.push(reportsTab);
  }

  return {
    tabs: baseTabs,
    isLoading,
  };
}
