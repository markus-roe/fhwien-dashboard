import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { isAfter, startOfToday } from "date-fns";
import type { Session } from "@/shared/data/mockData";
import { Button } from "@/shared/components/ui/Button";

type GroupAppointmentsListProps = {
  appointments: Session[];
  onAddAppointment: () => void;
};

export function GroupAppointmentsList({
  appointments,
  onAddAppointment,
}: GroupAppointmentsListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-[9px] sm:text-[10px] font-medium text-zinc-500">
          Termine ({appointments.length})
        </h4>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddAppointment();
          }}
          variant="secondary"
          className="h-5 px-1.5"
          icon={Plus}
          iconPosition="left"
        >
          <span className="sr-only">Termin hinzufügen</span>
        </Button>
      </div>
      {appointments.length === 0 ? (
        <p className="text-[9px] sm:text-[10px] text-zinc-400 italic">
          Noch keine Termine
        </p>
      ) : (
        <div className="space-y-1">
          {appointments
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((appointment) => (
              <div
                key={appointment.id}
                className={`flex items-center gap-1.5 text-[9px] sm:text-[10px] rounded-md p-1 transition-colors ${
                  isAfter(appointment.date, startOfToday())
                    ? "bg-zinc-50 hover:bg-zinc-100"
                    : "bg-zinc-100 opacity-60"
                }`}
              >
                <CalendarIcon className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900">
                    {appointment.title}
                  </div>
                  <div className="text-zinc-500">
                    {format(appointment.date, "d. MMM", {
                      locale: de,
                    })}{" "}
                    {appointment.time} - {appointment.endTime}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
