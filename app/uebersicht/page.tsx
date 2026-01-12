"use client";

import { Users, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { SessionPanel } from "@/features/schedule/components/SessionPanel";
import { useSessionPanel } from "@/features/schedule/components/hooks/useSessionPanel";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { useCoachingSlots } from "@/features/coaching/hooks/useCoachingSlots";
import { useCourses } from "@/shared/hooks/useCourses";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

export default function UebersichtPage() {
    const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
        useSessionPanel();

    // Fetch data from APIs
    const { user: currentUser, loading: userLoading } = useCurrentUser();
    const { groups, loading: groupsLoading } = useGroups();
    const { slots: coachingSlots, loading: coachingSlotsLoading } = useCoachingSlots();
    const { courses, loading: coursesLoading } = useCourses();

    const isLoading = userLoading || groupsLoading || coachingSlotsLoading || coursesLoading;

    const now = new Date();

    // Get user's groups
    const userGroups = currentUser
        ? groups.filter((group) => group.members.some((member) => member.id === currentUser.id))
        : [];

    // Get upcoming coaching slots for the current user
    const upcomingCoachings = currentUser
        ? coachingSlots
            .filter((slot) => new Date(slot.date) > now && slot.participants.some((participant) => participant.id === currentUser.id))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : [];

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("de-DE", {
            weekday: "short",
            day: "2-digit",
            month: "short",
        }).format(date);
    };

    const getCourseById = (courseId: number) => {
        return courses.find((course) => course.id === courseId);
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex flex-col h-full min-h-0">
                <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                    <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
                        <Sidebar onSessionClick={openSessionPanel} />
                    </aside>
                    <div className="flex-1 min-w-0 space-y-3">
                        <Card>
                            <CardContent className="p-3 sm:p-4">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-8 bg-zinc-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="h-24 bg-zinc-200 rounded"></div>
                                        <div className="h-24 bg-zinc-200 rounded"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
                    <Sidebar onSessionClick={openSessionPanel} />
                </aside>

                <div className="flex-1 min-w-0 space-y-3">
                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            {/* Header */}
                            <div className="mb-6">
                                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1">
                                    Übersicht
                                </h1>
                                <p className="text-sm text-zinc-600">
                                    Willkommen zurück{currentUser ? `, ${currentUser.name}` : ""}!
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                <div className="p-4 bg-gradient-to-br from-[#012f64]/5 to-[#012f64]/10 border border-[#012f64]/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#012f64] rounded-lg">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#012f64] font-medium">Meine Gruppen</p>
                                            <p className="text-xl font-bold text-[#012f64]">{userGroups.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-[#012f64]/5 to-[#012f64]/10 border border-[#012f64]/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#012f64] rounded-lg">
                                            <MessageSquare className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#012f64] font-medium">Coaching Termine</p>
                                            <p className="text-xl font-bold text-[#012f64]">{upcomingCoachings.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Two Column Layout - Groups and Coachings */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Left Column - My Groups */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-base font-semibold text-zinc-900">Meine Gruppen</h2>
                                        <Link
                                            href="/gruppen"
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Alle anzeigen →
                                        </Link>
                                    </div>

                                    <div className="space-y-2">
                                        {userGroups.length === 0 ? (
                                            <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                                                <Users className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                                                <p className="text-sm text-zinc-500 mb-1">Keine Gruppen</p>
                                                <p className="text-xs text-zinc-400">
                                                    Du bist aktuell in keiner Gruppe
                                                </p>
                                            </div>
                                        ) : (
                                            userGroups.map((group) => {
                                                const course = getCourseById(group.courseId);
                                                return (
                                                    <Link
                                                        key={group.id}
                                                        href="/gruppen"
                                                        className="block p-3 bg-white border border-zinc-200 rounded-lg hover:shadow-sm hover:border-zinc-300 transition-all"
                                                    >
                                                        <div className="space-y-1.5">
                                                            <div>
                                                                <h3 className="text-sm font-semibold text-zinc-900">
                                                                    {group.name}
                                                                </h3>
                                                                <p className="text-xs text-zinc-600">{course?.title}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                                                                <Users className="w-3.5 h-3.5" />
                                                                <span>
                                                                    {group.members.length}
                                                                    {group.maxMembers && `/${group.maxMembers}`} Mitglieder
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Coachings */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-base font-semibold text-zinc-900">Meine Coachings</h2>
                                        <Link
                                            href="/coaching"
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Alle anzeigen →
                                        </Link>
                                    </div>

                                    <div className="space-y-2">
                                        {upcomingCoachings.length === 0 ? (
                                            <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                                                <MessageSquare className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                                                <p className="text-sm text-zinc-500 mb-1">Keine Coachings gebucht</p>
                                                <Link href="/coaching">
                                                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2">
                                                        Coaching buchen
                                                    </button>
                                                </Link>
                                            </div>
                                        ) : (
                                            upcomingCoachings.map((coaching) => {
                                                const course = getCourseById(coaching.courseId);
                                                return (
                                                    <Link
                                                        key={coaching.id}
                                                        href="/coaching"
                                                        className="block p-3 bg-white border border-zinc-200 rounded-lg hover:shadow-sm hover:border-zinc-300 transition-all"
                                                    >
                                                        <div className="space-y-1.5">
                                                            <p className="text-sm font-semibold text-zinc-900">
                                                                {course?.title}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span>
                                                                    {formatDate(new Date(coaching.date))} • {coaching.time}
                                                                </span>
                                                            </div>
                                                            {coaching.description && (
                                                                <p className="text-xs text-zinc-500 line-clamp-2">
                                                                    {coaching.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Link>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <SessionPanel
                session={selectedSession}
                isOpen={isPanelOpen}
                onClose={closeSessionPanel}
            />
        </div>
    );
}
