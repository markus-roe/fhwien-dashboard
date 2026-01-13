"use client";

import { useState } from "react";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { SessionPanel } from "@/features/schedule/components/SessionPanel";
import { useSessionPanel } from "@/features/schedule/components/hooks/useSessionPanel";
import { CreateGroupDialog } from "@/features/groups/components/CreateGroupDialog";
import type { CreateGroupFormData } from "@/features/groups/types";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { useCourses } from "@/shared/hooks/useCourses";
import { useGroupFilters } from "@/features/groups/hooks/useGroupFilters";
import { useGroupOperations } from "@/features/groups/hooks/useGroupOperations";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { SegmentedTabs } from "@/shared/components/ui/SegmentedTabs";
import { Input } from "@/shared/components/ui/Input";
import { CourseFilterButtons } from "@/features/groups/components/CourseFilterButtons";
import { Button } from "@/shared/components/ui/Button";
import { GroupsList } from "@/features/groups/components/GroupsList";
import { LoadingSkeletonGroupCards } from "@/shared/components/ui/LoadingSkeleton";

export default function GruppenPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"myGroups" | "allGroups">(
    "allGroups"
  );
  const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
    useSessionPanel();

  // Aktuellen User von der API laden
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  // Always fetch all groups, filter client-side
  const {
    groups: allGroups,
    loading: groupsLoading,
    createGroup,
    joinGroup,
    leaveGroup,
  } = useGroups();

  const { courses, loading: coursesLoading } = useCourses();
  const isLoading = groupsLoading || coursesLoading;

  // Filtering logic - jetzt mit echtem currentUser
  const {
    totalGroupCount,
    courseGroupCounts,
    filteredGroups,
    myGroups,
    totalMyGroupsCount,
  } = useGroupFilters({
    allGroups,
    courses,
    selectedCourseId,
    searchQuery,
    currentUser, // Echten User übergeben
  });

  // Group operations
  const {
    handleCreateGroup: handleCreateGroupBase,
    handleJoinGroup,
    handleLeaveGroup,
    isUserInGroup,
    isGroupFull,
  } = useGroupOperations({
    createGroup,
    joinGroup,
    leaveGroup,
    currentUser,
  });

  const handleCreateGroup = async (data: CreateGroupFormData) => {
    await handleCreateGroupBase({
      courseId: data.courseId ? parseInt(data.courseId) : selectedCourseId || undefined,
      name: data.name,
      description: data.description,
      maxMembers: data.maxMembers,
    });
  };

  const handleCoursePrefill = (courseId: string | null) => {
    if (!selectedCourseId) {
      setSelectedCourseId(courseId ? parseInt(courseId) : null);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
          <Sidebar onSessionClick={openSessionPanel} />
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
                    courses={courses}
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
                        <GroupsList
                          groups={myGroups}
                          courses={courses}
                          isUserInGroup={isUserInGroup}
                          isGroupFull={isGroupFull}
                          onJoinGroup={(groupId) => handleJoinGroup(groupId)}
                          onLeaveGroup={(groupId) => handleLeaveGroup(groupId)}
                        />
                      )}
                    </div>
                  )}

                  {activeTab === "allGroups" && (
                    <div className="space-y-6">
                      {isLoading ? (
                        <LoadingSkeletonGroupCards />
                      ) : filteredGroups.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                          <p className="text-sm text-zinc-600 mb-1">
                            Keine Gruppen gefunden.
                          </p>
                          <p className="text-xs text-zinc-500">
                            Probiere einen anderen Kurs oder ändere die Suche.
                          </p>
                        </div>
                      ) : (
                        <GroupsList
                          groups={filteredGroups}
                          courses={courses}
                          isUserInGroup={isUserInGroup}
                          isGroupFull={isGroupFull}
                          onJoinGroup={(groupId) => handleJoinGroup(groupId)}
                          onLeaveGroup={(groupId) => handleLeaveGroup(groupId)}
                        />
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
        courses={courses}
        defaultCourseId={selectedCourseId?.toString() || null}
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
