/**
 * Übersichtsseite - Dashboard für Studierende
 * 
 * Diese Seite zeigt eine Zusammenfassung der wichtigsten Informationen:
 * - Anzahl der Gruppen, in denen der Student Mitglied ist
 * - Anzahl der gebuchten Coaching-Termine
 * - Liste aller Gruppen des Students
 * - Liste aller gebuchten Coachings
 */

"use client";

// Icons und UI-Komponenten importieren
import { Users, MessageSquare, Clock, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { SessionPanel } from "@/features/schedule/components/SessionPanel";
import { useSessionPanel } from "@/features/schedule/components/hooks/useSessionPanel";
import { useState, useEffect } from "react";

// Hooks zum Laden der Daten von der API
import { useGroups } from "@/features/groups/hooks/useGroups";
import { useCoachingSlots } from "@/features/coaching/hooks/useCoachingSlots";
import { useCourses } from "@/shared/hooks/useCourses";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

export default function UebersichtPage() {
    // Hook für das Session-Detail-Panel (öffnet sich beim Klick auf einen Termin)
    const { selectedSession, isPanelOpen, openSessionPanel, closeSessionPanel } =
        useSessionPanel();

    // Daten von der API laden
    const { user: currentUser, loading: userLoading } = useCurrentUser(); // Aktueller Benutzer
    const { groups, loading: groupsLoading } = useGroups(); // Alle Gruppen
    const { slots: coachingSlots, loading: coachingSlotsLoading } = useCoachingSlots(); // Alle Coaching-Slots
    const { courses, loading: coursesLoading } = useCourses(); // Alle Kurse

    // Prüfen, ob noch Daten geladen werden
    const isLoading = userLoading || groupsLoading || coachingSlotsLoading || coursesLoading;

    // Aktuelles Datum für Filterung
    const now = new Date();

    // Nur die Gruppen filtern, in denen der aktuelle Benutzer Mitglied ist
    const userGroups = currentUser
        ? groups.filter((group) => group.members.includes(currentUser.name))
        : [];

    // Nur die Coachings filtern, die:
    // 1. In der Zukunft liegen (date > now)
    // 2. Vom aktuellen Benutzer gebucht wurden
    // Dann nach Datum sortieren (älteste zuerst)
    const upcomingCoachings = currentUser
        ? coachingSlots
            .filter((slot) => slot.date > now && slot.participants.includes(currentUser.name))
            .sort((a, b) => a.date.getTime() - b.date.getTime())
        : [];

    // Hilfsfunktion: Datum in deutsches Format umwandeln (z.B. "Fr, 15. Nov")
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("de-DE", {
            weekday: "short",
            day: "2-digit",
            month: "short",
        }).format(date);
    };

    // Hilfsfunktion: Kurs anhand der ID finden
    const getCourseById = (courseId: string) => {
        return courses.find((course) => course.id === courseId);
    };

    // Countdown-Timer bis zum Studienabschluss (19. Juni 2027)
    const graduationDate = new Date("2027-06-19T00:00:00");

    // State für den Countdown (wird jede Minute aktualisiert)
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
    });

    // Funktion: Berechnet die verbleibende Zeit bis zum Abschluss
    const calculateTimeLeft = () => {
        const now = new Date();
        const difference = graduationDate.getTime() - now.getTime();

        // Wenn das Datum in der Vergangenheit liegt, zeige 0
        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0 };
        }

        // Berechne Tage, Stunden und Minuten
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes };
    };

    // useEffect: Aktualisiert den Countdown jede Minute
    useEffect(() => {
        // Sofort beim Laden berechnen
        setTimeLeft(calculateTimeLeft());

        // Dann jede Minute neu berechnen
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // 60000ms = 1 Minute

        // Cleanup: Timer stoppen, wenn Komponente unmountet wird
        return () => clearInterval(timer);
    }, []);

    // Lade-Animation anzeigen, solange Daten noch geladen werden
    if (isLoading) {
        return (
            <div className="flex flex-col h-full min-h-0">
                <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                    {/* Sidebar (nur auf großen Bildschirmen sichtbar) */}
                    <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
                        <Sidebar onSessionClick={openSessionPanel} />
                    </aside>

                    {/* Hauptinhalt mit Lade-Animation */}
                    <div className="flex-1 min-w-0 space-y-3">
                        <Card>
                            <CardContent className="p-3 sm:p-4">
                                {/* Pulsierende graue Balken als Platzhalter */}
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

    // Hauptinhalt der Seite (wird angezeigt, wenn alle Daten geladen sind)
    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
                {/* Sidebar mit Terminübersicht */}
                <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
                    <Sidebar onSessionClick={openSessionPanel} />
                </aside>

                {/* Hauptinhalt */}
                <div className="flex-1 min-w-0 space-y-3">
                    <Card>
                        <CardContent className="p-3 sm:p-4">
                            {/* Überschrift und Begrüßung */}
                            <div className="mb-6">
                                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-1">
                                    Übersicht
                                </h1>
                                <p className="text-sm text-zinc-600">
                                    Willkommen zurück{currentUser ? `, ${currentUser.name}` : ""}!
                                </p>
                            </div>

                            {/* Statistik-Karten: Zeigen Anzahl der Gruppen und Coachings */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                {/* Karte 1: Anzahl der Gruppen */}
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

                                {/* Karte 2: Anzahl der Coaching-Termine */}
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

                            {/* Zwei-Spalten-Layout: Gruppen links, Coachings rechts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Linke Spalte: Meine Gruppen */}
                                <div className="space-y-3">
                                    {/* Überschrift mit Link zu allen Gruppen */}
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
                                        {/* Wenn keine Gruppen vorhanden: Leere Nachricht anzeigen */}
                                        {userGroups.length === 0 ? (
                                            <div className="p-6 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/60">
                                                <Users className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                                                <p className="text-sm text-zinc-500 mb-1">Keine Gruppen</p>
                                                <p className="text-xs text-zinc-400">
                                                    Du bist aktuell in keiner Gruppe
                                                </p>
                                            </div>
                                        ) : (
                                            // Wenn Gruppen vorhanden: Jede Gruppe als Karte anzeigen
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
                                                                {/* Gruppenname */}
                                                                <h3 className="text-sm font-semibold text-zinc-900">
                                                                    {group.name}
                                                                </h3>
                                                                {/* Kursname */}
                                                                <p className="text-xs text-zinc-600">{course?.title}</p>
                                                            </div>
                                                            {/* Anzahl der Mitglieder */}
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

                                {/* Rechte Spalte: Meine Coachings */}
                                <div className="space-y-3">
                                    {/* Überschrift mit Link zu allen Coachings */}
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
                                        {/* Wenn keine Coachings gebucht: Leere Nachricht mit Button anzeigen */}
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
                                            // Wenn Coachings vorhanden: Jedes Coaching als Karte anzeigen
                                            upcomingCoachings.map((coaching) => {
                                                const course = getCourseById(coaching.courseId);
                                                return (
                                                    <Link
                                                        key={coaching.id}
                                                        href="/coaching"
                                                        className="block p-3 bg-white border border-zinc-200 rounded-lg hover:shadow-sm hover:border-zinc-300 transition-all"
                                                    >
                                                        <div className="space-y-1.5">
                                                            {/* Kursname */}
                                                            <p className="text-sm font-semibold text-zinc-900">
                                                                {course?.title}
                                                            </p>
                                                            {/* Datum und Uhrzeit */}
                                                            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span>
                                                                    {formatDate(coaching.date)} • {coaching.time}
                                                                </span>
                                                            </div>
                                                            {/* Beschreibung (falls vorhanden) */}
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

            {/* Countdown-Timer bis zum Studienabschluss (unten rechts fixiert) */}
            <div className="fixed bottom-6 right-6 z-30">
                <Card className="shadow-lg border-[#012f64]/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            {/* Icon */}
                            <div className="p-2 bg-[#012f64] rounded-lg">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>

                            {/* Countdown-Informationen */}
                            <div>
                                <p className="text-xs text-zinc-600 font-medium mb-1">
                                    Bis zum Abschluss
                                </p>
                                <div className="flex items-center gap-2">
                                    {/* Tage */}
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-[#012f64]">
                                            {timeLeft.days}
                                        </p>
                                        <p className="text-[10px] text-zinc-500">Tage</p>
                                    </div>
                                    <span className="text-zinc-400">:</span>

                                    {/* Stunden */}
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-[#012f64]">
                                            {timeLeft.hours}
                                        </p>
                                        <p className="text-[10px] text-zinc-500">Std</p>
                                    </div>
                                    <span className="text-zinc-400">:</span>

                                    {/* Minuten */}
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-[#012f64]">
                                            {timeLeft.minutes}
                                        </p>
                                        <p className="text-[10px] text-zinc-500">Min</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Session-Detail-Panel (öffnet sich beim Klick auf einen Termin in der Sidebar) */}
            <SessionPanel
                session={selectedSession}
                isOpen={isPanelOpen}
                onClose={closeSessionPanel}
            />
        </div>
    );
}
