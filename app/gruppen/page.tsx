"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SessionPanel } from "@/components/schedule/SessionPanel";
import { useSessionPanel } from "@/components/schedule/hooks/useSessionPanel";
import {
  CreateGroupDialog,
  type CreateGroupFormData,
} from "@/components/groups/CreateGroupDialog";
import { useGroups } from "@/hooks/useGroups";
import { useCourses } from "@/hooks/useCourses";
import { useGroupFilters } from "@/hooks/useGroupFilters";
import { useGroupOperations } from "@/hooks/useGroupOperations";
import { Card, CardContent } from "@/components/ui/Card";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { Input } from "@/components/ui/Input";
import { CourseFilterButtons } from "@/components/groups/CourseFilterButtons";
import { Button } from "@/components/ui/Button";
import { GroupsList } from "@/components/groups/GroupsList";
import { LoadingSkeletonGroupCards } from "@/components/ui/LoadingSkeleton";

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

  // Filtering logic
  const {
    totalGroupCount,
    courseGroupCounts,
    filteredGroups,
    myGroups,
    totalMyGroupsCount,
  } = useGroupFilters({
    allGroups,
    courses: mockCourses,
    selectedCourseId,
    searchQuery,
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
  });

  const handleCreateGroup = async (data: CreateGroupFormData) => {
    await handleCreateGroupBase({
      courseId: data.courseId || selectedCourseId || undefined,
      name: data.name,
      description: data.description,
      maxMembers: data.maxMembers,
    });
  };

  const handleCoursePrefill = (courseId: string | null) => {
    if (!selectedCourseId) {
      setSelectedCourseId(courseId);
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
                        <GroupsList
                          groups={myGroups}
                          courses={mockCourses}
                          isUserInGroup={isUserInGroup}
                          isGroupFull={isGroupFull}
                          onJoinGroup={handleJoinGroup}
                          onLeaveGroup={handleLeaveGroup}
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
                          courses={mockCourses}
                          isUserInGroup={isUserInGroup}
                          isGroupFull={isGroupFull}
                          onJoinGroup={handleJoinGroup}
                          onLeaveGroup={handleLeaveGroup}
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
