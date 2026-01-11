"use client";

import { Calendar, Users, MessageSquare, Clock, MapPin, Video } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { SessionPanel } from "@/features/schedule/components/SessionPanel";
import { useSessionPanel } from "@/features/schedule/components/hooks/useSessionPanel";
import { useSessions } from "@/features/sessions/hooks/useSessions";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { useCoachingSlots } from "@/features/coaching/hooks/useCoachingSlots";
import { useCourses } from "@/shared/hooks/useCourses";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

export default function UebersichtPage() {
    const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
        useSessionPanel();

    // Fetch data from APIs
    const { user: currentUser, loading: userLoading } = useCurrentUser();
    const { sessions, loading: sessionsLoading } = useSessions();
    const { groups, loading: groupsLoading } = useGroups();
    const { slots: coachingSlots, loading: coachingSlotsLoading } = useCoachingSlots();
    const { courses, loading: coursesLoading } = useCourses();

    const isLoading = userLoading || sessionsLoading || groupsLoading || coachingSlotsLoading || coursesLoading;

    // Get upcoming sessions (next 5)
    const now = new Date();
    const upcomingSessions = sessions
        .filter((session) => session.date > now)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);

    // Get user's groups
    const userGroups = currentUser
        ? groups.filter((group) => group.members.includes(currentUser.name))
        : [];

    // Get upcoming coaching slots for the current user
    const upcomingCoachings = currentUser
        ? coachingSlots
            .filter((slot) => slot.date > now && slot.participants.includes(currentUser.name))
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 3)
        : [];

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("de-DE", {
            weekday: "short",
            day: "2-digit",
            month: "short",
        }).format(date);
    };

    const getCourseById = (courseId: string) => {
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
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="h-24 bg-zinc-200 rounded"></div>
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-700 font-medium">Nächste Termine</p>
                                            <p className="text-xl font-bold text-blue-900">{upcomingSessions.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500 rounded-lg">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-purple-700 font-medium">Meine Gruppen</p>
                                            <p className="text-xl font-bold text-purple-900">{userGroups.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500 rounded-lg">
                                            <MessageSquare className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-emerald-700 font-medium">Coaching Termine</p>
                                            <p className="text-xl font-bold text-emerald-900">{upcomingCoachings.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Left Column - Upcoming Sessions */}
                                <div className="lg:col-span-2 space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-base font-semibold text-zinc-900">Nächste Termine</h2>
                                        <Link
                                            href="/schedule"
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Alle anzeigen →
                                        </Link>
                                    </div>

                                    <div className="space-y-2">
                                        {upcomingSessions.length === 0 ? (
                                            <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                                                <Calendar className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                                                <p className="text-sm text-zinc-500">Keine anstehenden Termine</p>
                                            </div>
                                        ) : (
                                            upcomingSessions.map((session) => {
                                                const course = getCourseById(session.courseId);
                                                return (
                                                    <div
                                                        key={session.id}
                                                        onClick={() => openSessionPanel(session)}
                                                        className="p-3 bg-white border border-zinc-200 rounded-lg hover:shadow-sm hover:border-zinc-300 transition-all cursor-pointer"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 text-center min-w-[50px]">
                                                                <div className="text-[10px] font-medium text-zinc-500 uppercase">
                                                                    {formatDate(session.date).split(",")[0]}
                                                                </div>
                                                                <div className="text-xl font-bold text-zinc-900">
                                                                    {session.date.getDate()}
                                                                </div>
                                                                <div className="text-[10px] text-zinc-500">
                                                                    {formatDate(session.date).split(",")[1]?.trim()}
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                                    <div>
                                                                        <h3 className="text-sm font-semibold text-zinc-900 mb-0.5">
                                                                            {session.title}
                                                                        </h3>
                                                                        <p className="text-xs text-zinc-600">{course?.title}</p>
                                                                    </div>
                                                                    <Badge
                                                                        variant={
                                                                            session.type === "lecture"
                                                                                ? "blue"
                                                                                : session.type === "workshop"
                                                                                    ? "purple"
                                                                                    : "default"
                                                                        }
                                                                        size="xs"
                                                                    >
                                                                        {session.type === "lecture"
                                                                            ? "VL"
                                                                            : session.type === "workshop"
                                                                                ? "WS"
                                                                                : "CO"}
                                                                    </Badge>
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        <span>
                                                                            {session.time} - {session.endTime}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {session.locationType === "online" ? (
                                                                            <>
                                                                                <Video className="w-3.5 h-3.5" />
                                                                                <span>Online</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <MapPin className="w-3.5 h-3.5" />
                                                                                <span>{session.location}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Groups & Coachings */}
                                <div className="space-y-4">
                                    {/* My Groups */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-base font-semibold text-zinc-900">Meine Gruppen</h2>
                                            <Link
                                                href="/gruppen"
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Alle →
                                            </Link>
                                        </div>

                                        <div className="space-y-2">
                                            {userGroups.length === 0 ? (
                                                <div className="p-4 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                                                    <Users className="w-8 h-8 text-zinc-300 mx-auto mb-1" />
                                                    <p className="text-xs text-zinc-500">Keine Gruppen</p>
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

                                    {/* Upcoming Coachings */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-base font-semibold text-zinc-900">Coachings</h2>
                                            <Link
                                                href="/coaching"
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Alle →
                                            </Link>
                                        </div>

                                        <div className="space-y-2">
                                            {upcomingCoachings.length === 0 ? (
                                                <div className="p-4 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                                                    <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto mb-1" />
                                                    <p className="text-xs text-zinc-500 mb-2">Keine Coachings gebucht</p>
                                                    <Link href="/coaching">
                                                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
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
                                                                <p className="text-sm font-medium text-zinc-900">
                                                                    {course?.title}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    <span>
                                                                        {formatDate(coaching.date)} • {coaching.time}
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

                                    {/* Quick Actions */}
                                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                                        <h3 className="text-sm font-semibold text-zinc-900 mb-2">Schnellzugriff</h3>
                                        <div className="space-y-1">
                                            <Link
                                                href="/schedule"
                                                className="flex items-center gap-2 p-2 rounded-md hover:bg-white transition-colors"
                                            >
                                                <Calendar className="w-4 h-4 text-zinc-500" />
                                                <span className="text-xs text-zinc-700">Terminplan</span>
                                            </Link>
                                            <Link
                                                href="/gruppen"
                                                className="flex items-center gap-2 p-2 rounded-md hover:bg-white transition-colors"
                                            >
                                                <Users className="w-4 h-4 text-zinc-500" />
                                                <span className="text-xs text-zinc-700">Gruppen</span>
                                            </Link>
                                            <Link
                                                href="/coaching"
                                                className="flex items-center gap-2 p-2 rounded-md hover:bg-white transition-colors"
                                            >
                                                <MessageSquare className="w-4 h-4 text-zinc-500" />
                                                <span className="text-xs text-zinc-700">Coaching buchen</span>
                                            </Link>
                                        </div>
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
