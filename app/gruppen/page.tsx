"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionPanel } from "@/components/schedule/SessionPanel";
import { useSessionPanel } from "@/components/schedule/hooks/useSessionPanel";
import {
  CreateGroupDialog,
  type CreateGroupFormData,
} from "@/components/groups/CreateGroupDialog";
import { currentUser, type Group } from "@/data/mockData";
import { useGroups } from "@/hooks/useGroups";
import { useCourses } from "@/hooks/useCourses";
import { Card, CardContent } from "@/components/ui/Card";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { Input } from "@/components/ui/Input";
import { CourseFilterButtons } from "@/components/groups/CourseFilterButtons";
import { Button } from "@/components/ui/Button";
import { GroupCard } from "@/components/groups/GroupCard";
import {
  LoadingState,
  LoadingSkeletonCard,
  LoadingSkeletonGroupCard,
  LoadingSkeleton,
  LoadingSkeletonGroupCards,
} from "@/components/ui/LoadingSkeleton";

export default function GruppenPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"myGroups" | "allGroups">(
    "allGroups"
  );
  const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
    useSessionPanel();

  // Always fetch all groups, filter client-side
  const {
    groups: allGroups,
    loading: groupsLoading,
    createGroup,
    joinGroup,
    leaveGroup,
  } = useGroups();

  const { courses: mockCourses, loading: coursesLoading } = useCourses();
  const isLoading = groupsLoading || coursesLoading;

  // Calculate counts based on ALL groups
  const totalGroupCount = allGroups.length;

  const courseGroupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockCourses.forEach((course) => {
      counts[course.id] = 0;
    });
    allGroups.forEach((group) => {
      counts[group.courseId] = (counts[group.courseId] ?? 0) + 1;
    });
    return counts;
  }, [allGroups, mockCourses]);

  // Filter groups by selected course and search query (client-side)
  const filteredGroups = useMemo(() => {
    let filtered = allGroups;

    // Filter by course
    if (selectedCourseId) {
      filtered = filtered.filter((g) => g.courseId === selectedCourseId);
    }

    // Filter by search query
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
          g.members.some((m) => m.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCourseId, allGroups, searchQuery, mockCourses]);

  const myGroups = useMemo(() => {
    return filteredGroups.filter((g) =>
      g.members.some((m) => m === currentUser.name)
    );
  }, [filteredGroups]);

  const totalMyGroupsCount = useMemo(() => {
    return allGroups.filter((g) =>
      g.members.some((m) => m === currentUser.name)
    ).length;
  }, [allGroups]);

  const courseGroups = useMemo(() => {
    return filteredGroups;
  }, [filteredGroups]);

  // Update groups reference for compatibility with existing code
  const groups = filteredGroups;

  const handleCreateGroup = async (data: CreateGroupFormData) => {
    const courseId = data.courseId || selectedCourseId;
    if (!courseId || !data.name.trim()) return;

    try {
      await createGroup({
        courseId,
        name: data.name,
        description: data.description,
        maxMembers: data.maxMembers,
      });
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId);
    } catch (error) {
      console.error("Failed to join group:", error);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveGroup(groupId);
    } catch (error) {
      console.error("Failed to leave group:", error);
    }
  };

  const isUserInGroup = (group: Group) => {
    return group.members.some((m) => m === currentUser.name);
  };

  const isGroupFull = (group: Group) => {
    return group.maxMembers ? group.members.length >= group.maxMembers : false;
  };

  const handleCoursePrefill = (courseId: string | null) => {
    if (!selectedCourseId) {
      setSelectedCourseId(courseId);
    }
  };

  const renderGroupsList = (groupsToRender: Group[]) => {
    if (groupsToRender.length === 0) {
      return null;
    }

    // Group groups by courseId
    const groupsByCourse = groupsToRender.reduce((acc, group) => {
      if (!acc[group.courseId]) {
        acc[group.courseId] = [];
      }
      acc[group.courseId].push(group);
      return acc;
    }, {} as Record<string, Group[]>);

    // Get course IDs in the same order as the filter buttons (courses array order)
    const courseIdsWithGroups = mockCourses
      .map((course) => course.id)
      .filter(
        (courseId) =>
          groupsByCourse[courseId] && groupsByCourse[courseId].length > 0
      );

    return (
      <div className="w-full">
        <div className="space-y-4">
          {courseIdsWithGroups.map((courseId, courseIndex) => {
            const course = mockCourses.find((c) => c.id === courseId);
            const courseGroups = groupsByCourse[courseId];

            return (
              <div key={courseId}>
                {courseIndex > 0 && (
                  <div className="border-t border-zinc-100 mb-4" />
                )}
                <div className="mb-2.5">
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    {course?.title || "Unbekannter Kurs"}
                  </h4>
                </div>
                <div className="space-y-2.5">
                  {courseGroups.map((group) => {
                    const userInGroup = isUserInGroup(group);
                    const full = isGroupFull(group);

                    return (
                      <GroupCard
                        key={group.id}
                        group={group}
                        course={course}
                        isUserInGroup={userInGroup}
                        isGroupFull={full}
                        onJoinGroup={handleJoinGroup}
                        onLeaveGroup={handleLeaveGroup}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
          <Sidebar
            showCalendar={true}
            showNextUpCard={false}
            onSessionClick={openSessionPanel}
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-3">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                  Gruppen
                </h1>
              </div>
              <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Input
                    type="text"
                    placeholder="Gruppen durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  iconPosition="left"
                  className="w-full sm:w-auto"
                >
                  <span className="inline">Neue Gruppe</span>
                </Button>
              </div>

              <SegmentedTabs
                value={activeTab}
                onChange={(value) =>
                  setActiveTab(value as "myGroups" | "allGroups")
                }
                options={[
                  {
                    value: "allGroups",
                    label: "Alle Gruppen",
                    badge: totalGroupCount > 0 ? totalGroupCount : undefined,
                    loading: isLoading,
                  },
                  {
                    value: "myGroups",
                    label: "Meine Gruppen",
                    badge:
                      totalMyGroupsCount > 0 ? totalMyGroupsCount : undefined,
                    loading: isLoading,
                  },
                ]}
                className="mb-4"
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-[200px] shrink-0 space-y-3">
                  <CourseFilterButtons
                    courses={mockCourses}
                    selectedCourseId={selectedCourseId}
                    onSelectCourse={setSelectedCourseId}
                    totalGroupCount={totalGroupCount}
                    courseGroupCounts={courseGroupCounts}
                    loading={isLoading}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {activeTab === "myGroups" && (
                    <div className="space-y-6">
                      {myGroups.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                          <p className="text-sm text-zinc-600 mb-1">
                            Du bist aktuell in keiner Gruppe.
                          </p>
                          <p className="text-xs text-zinc-500">
                            Wechsle zur Ansicht{" "}
                            <span className="font-medium">
                              &quot;Alle Gruppen&quot;
                            </span>{" "}
                            um einer Gruppe beizutreten oder eine neue zu
                            erstellen.
                          </p>
                        </div>
                      ) : (
                        renderGroupsList(myGroups)
                      )}
                    </div>
                  )}

                  {activeTab === "allGroups" && (
                    <div className="space-y-6">
                      {isLoading ? (
                        <LoadingSkeletonGroupCards />
                      ) : courseGroups.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                          <p className="text-sm text-zinc-600 mb-1">
                            Keine Gruppen gefunden.
                          </p>
                          <p className="text-xs text-zinc-500">
                            Probiere einen anderen Kurs oder ändere die Suche.
                          </p>
                        </div>
                      ) : (
                        renderGroupsList(courseGroups)
                      )}
                    </div>
                  )}
                </div>
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
