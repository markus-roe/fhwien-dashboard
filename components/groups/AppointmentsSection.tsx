import { Plus } from "lucide-react";
import type { Group, Session } from "@/data/mockData";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SmallCalendar } from "./SmallCalendar";
import { NextUpList } from "@/components/schedule/NextUpList";
import { EventPopover } from "@/components/schedule/EventPopover";
import { sessionToEvent } from "@/components/schedule/utils/calendarHelpers";
import type { CalendarEvent } from "@/components/schedule/types/calendar";
import { useCallback, useMemo, useState, type MouseEvent } from "react";
import { isAfter, startOfToday } from "date-fns";

type AppointmentsSectionProps = {
  allMyGroupAppointments: Session[];
  allSessions: Session[];
  myGroups: Group[];
  onOpenAppointmentModal: (groupId: string) => void;
  onSessionClick?: (session: Session) => void;
};

export function AppointmentsSection({
  allMyGroupAppointments,
  allSessions,
  myGroups,
  onOpenAppointmentModal,
  onSessionClick,
}: AppointmentsSectionProps) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[] | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showEventPopover, setShowEventPopover] = useState(false);

  const handleTimelineSessionClick = useCallback(
    (sessionId: string) => {
      const session = allSessions.find((s) => s.id === sessionId);
      if (session) {
        onSessionClick?.(session);
      }
    },
    [allSessions, onSessionClick]
  );

  const nextUpSessions = useMemo(() => {
    const now = new Date();

    return allMyGroupAppointments
      .filter((appointment) => isAfter(appointment.date, now))
      .map((appointment) => {
        const sessionStart = new Date(appointment.date);
        const sessionEnd = new Date(appointment.date);
        const [startHours, startMinutes] = appointment.time
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = appointment.endTime
          .split(":")
          .map(Number);

        sessionStart.setHours(startHours, startMinutes, 0, 0);
        sessionEnd.setHours(endHours, endMinutes, 0, 0);

        return {
          id: appointment.id,
          time: appointment.time,
          title: appointment.title,
          date: appointment.date,
          type:
            appointment.type === "lecture"
              ? "Vorlesung"
              : appointment.type === "workshop"
              ? "Workshop"
              : "Coaching",
          location:
            appointment.location ||
            (appointment.locationType === "online" ? "Online" : "Vor Ort"),
          isPast: sessionEnd < now,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [allMyGroupAppointments]);

  const handleClosePopover = useCallback(() => {
    setShowEventPopover(false);
    setSelectedDayEvents(null);
    setPopoverPosition(null);
  }, []);

  const handleCalendarDayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>, dayAppointments: Session[]) => {
      if (dayAppointments.length === 0) return;
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;
      const isMobile = window.innerWidth < 640;
      const popoverWidth = isMobile ? 260 : 280;
      const popoverHeight = 320;
      let top = rect.bottom + scrollTop + 4;
      let left = rect.left + scrollLeft;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 8;

      if (isMobile) {
        left = Math.max(
          padding,
          Math.min(left, viewportWidth - popoverWidth - padding)
        );
      } else {
        if (left + popoverWidth > viewportWidth - padding) {
          left = viewportWidth - popoverWidth - padding;
        }
        if (left < padding) {
          left = padding;
        }
      }

      if (top + popoverHeight > scrollTop + viewportHeight - padding) {
        top = rect.top + scrollTop - popoverHeight - 4;
        if (top < scrollTop + padding) {
          top = scrollTop + padding;
        }
      }

      setSelectedDayEvents(dayAppointments.map(sessionToEvent));
      setPopoverPosition({ top, left });
      setShowEventPopover(true);
    },
    []
  );

  const handleCreateAppointment = () => {
    if (myGroups.length === 0) return;
    // If only one group, open directly; otherwise could show a selector
    if (myGroups.length === 1) {
      onOpenAppointmentModal(myGroups[0].id);
    } else {
      // For now, open with first group - could be enhanced with a group selector
      onOpenAppointmentModal(myGroups[0].id);
    }
  };

  return (
    <>
      <div className="w-full space-y-4">
        <div className="space-y-4">
          <SmallCalendar
            allSessions={allSessions}
            onDayClick={handleCalendarDayClick}
            date={calendarDate}
            onDateChange={setCalendarDate}
          />

          <NextUpList
            sessions={nextUpSessions}
            title="Meine Gruppentermine"
            emptyMessage="Noch keine Gruppentermine geplant."
            onSessionClick={handleTimelineSessionClick}
          />
        </div>
      </div>

      {showEventPopover && popoverPosition && selectedDayEvents && (
        <EventPopover
          events={selectedDayEvents}
          position={popoverPosition}
          onClose={handleClosePopover}
          onSessionClick={(session) => {
            onSessionClick?.(session);
          }}
        />
      )}
    </>
  );
}

