"use client";

import { useMemo, useState } from "react";
import { GroupSearchSection } from "@/components/groups/GroupSearchSection";
import { MyGroupsSection } from "@/components/groups/MyGroupsSection";
import { GroupsSidebar } from "@/components/groups/GroupsSidebar";
import { SessionPanel } from "@/components/schedule/SessionPanel";
import { useSessionPanel } from "@/components/schedule/hooks/useSessionPanel";
import {
  CreateGroupDialog,
  type CreateGroupFormData,
} from "@/components/groups/CreateGroupDialog";
import {
  mockGroups,
  mockCourses,
  currentUser,
  type Group,
} from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/Card";

export default function GruppenPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    selectedSession,
    isPanelOpen,
    openSessionPanel,
    closeSessionPanel,
  } = useSessionPanel();

  const myGroups = useMemo(() => {
    return groups.filter((g) => g.members.some((m) => m.id === currentUser.id));
  }, [groups]);

  const courseGroups = useMemo(() => {
    let filtered = selectedCourseId
      ? groups.filter((g) => g.courseId === selectedCourseId)
      : groups;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query) ||
          mockCourses
            .find((c) => c.id === g.courseId)
            ?.title.toLowerCase()
            .includes(query) ||
          g.members.some(
            (m) =>
              m.name.toLowerCase().includes(query) ||
              m.initials.toLowerCase().includes(query) ||
              m.email.toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  }, [selectedCourseId, groups, searchQuery]);

  const totalGroupCount = groups.length;

  const courseGroupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockCourses.forEach((course) => {
      counts[course.id] = 0;
    });
    groups.forEach((group) => {
      counts[group.courseId] = (counts[group.courseId] ?? 0) + 1;
    });
    return counts;
  }, [groups]);


  const handleCreateGroup = (data: CreateGroupFormData) => {
    const courseId = data.courseId || selectedCourseId;
    if (!courseId || !data.name.trim()) return;

    const newGroup: Group = {
      id: `g${Date.now()}`,
      courseId,
      name: data.name,
      description: data.description || undefined,
      maxMembers: data.maxMembers || undefined,
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          initials: currentUser.initials,
          email: currentUser.email,
          program: currentUser.program,
        },
      ],
      createdAt: new Date(),
    };

    setGroups((prev) => [...prev, newGroup]);
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;

        const isAlreadyMember = group.members.some(
          (m) => m.id === currentUser.id
        );
        if (isAlreadyMember) return group;

        if (group.maxMembers && group.members.length >= group.maxMembers) {
          return group;
        }

        return {
          ...group,
          members: [
            ...group.members,
            {
              id: currentUser.id,
              name: currentUser.name,
              initials: currentUser.initials,
              email: currentUser.email,
              program: currentUser.program,
            },
          ],
        };
      })
    );
  };

  const handleLeaveGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          members: group.members.filter((m) => m.id !== currentUser.id),
        };
      })
    );
  };

  const isUserInGroup = (group: Group) => {
    return group.members.some((m) => m.id === currentUser.id);
  };

  const isGroupFull = (group: Group) => {
    return group.maxMembers ? group.members.length >= group.maxMembers : false;
  };

  const handleCoursePrefill = (courseId: string | null) => {
    if (!selectedCourseId) {
      setSelectedCourseId(courseId);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-auto">
            <GroupsSidebar
              myGroups={myGroups}
              courses={mockCourses}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              onLeaveGroup={handleLeaveGroup}
              onCreateGroup={handleCreateGroup}
              onSessionClick={openSessionPanel}
            />
          </aside>

          <div className="flex-1 min-w-0 space-y-6">
            <Card>
              <CardContent className="p-4">
              {myGroups.length > 0 && (
                <>
                <MyGroupsSection
                myGroups={myGroups}
                courses={mockCourses}
                isUserInGroup={isUserInGroup}
                isGroupFull={isGroupFull}
                onJoinGroup={handleJoinGroup}
                onLeaveGroup={handleLeaveGroup}
              />
            </>
            )}

            <div className="mt-6">
              <GroupSearchSection
                courseGroups={courseGroups}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCreateGroupClick={() => setIsCreateModalOpen(true)}
                courses={mockCourses}
                isUserInGroup={isUserInGroup}
                isGroupFull={isGroupFull}
                onJoinGroup={handleJoinGroup}
                onLeaveGroup={handleLeaveGroup}
                selectedCourseId={selectedCourseId}
                onSelectCourse={setSelectedCourseId}
                totalGroupCount={totalGroupCount}
                courseGroupCounts={courseGroupCounts}
              />
            </div>
            </CardContent>
            </Card>
          </div>
        </div>

        <CreateGroupDialog
          isOpen={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          courses={mockCourses}
          defaultCourseId={selectedCourseId}
          onCoursePrefill={handleCoursePrefill}
          onSubmit={handleCreateGroup}
        />

        <SessionPanel
          session={selectedSession}
          isOpen={isPanelOpen}
          onClose={closeSessionPanel}
        />
      </div>
  );
}
