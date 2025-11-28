import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { MouseEvent } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Session } from "@/data/mockData";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getSessionColor } from "@/components/schedule/utils/calendarHelpers";

type SmallCalendarProps = {
  allSessions: Session[];
  onDayClick?: (
    event: MouseEvent<HTMLDivElement>,
    dayAppointments: Session[]
  ) => void;
  date?: Date;
  onDateChange?: (date: Date) => void;
  footerContent?: ReactNode;
};

export function SmallCalendar({
  allSessions,
  onDayClick,
  date: controlledDate,
  onDateChange,
  footerContent,
}: SmallCalendarProps) {
  const [internalDate, setInternalDate] = useState(new Date());
  const calendarDate = controlledDate ?? internalDate;

  useEffect(() => {
    if (controlledDate) {
      setInternalDate(controlledDate);
    }
  }, [controlledDate]);

  const setCalendarDate = useCallback(
    (newDate: Date) => {
      setInternalDate(newDate);
      onDateChange?.(newDate);
    },
    [onDateChange]
  );

  const handleCalendarDayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>, dayAppointments: Session[]) => {
      if (dayAppointments.length === 0) return;
      onDayClick?.(event, dayAppointments);
    },
    [onDayClick]
  );

  const calendarContent = useMemo(() => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const appointmentsByDate = allSessions.reduce((map, appointment) => {
      const key = format(appointment.date, "yyyy-MM-dd");
      const existing = map.get(key) || [];
      existing.push(appointment);
      map.set(key, existing);
      return map;
    }, new Map<string, Session[]>());

    return (
      <Card className="relative overflow-hidden select-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)]" />
        <CardHeader className="p-2">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
              className="p-1.5 hover:bg-zinc-100 rounded transition-colors flex items-center justify-center"
              aria-label="Vorheriger Monat"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-600" />
            </button>
            <button
              onClick={() => setCalendarDate(new Date())}
              className="p-1.5 hover:bg-zinc-100 rounded transition-colors flex items-center justify-center"
              aria-label="Aktueller Monat"
            >
              <h3 className="text-sm font-semibold text-zinc-900 flex-1 text-center">
                {format(calendarDate, "MMMM yyyy", { locale: de })}
              </h3>
            </button>
            <button
              onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
              className="p-1.5 hover:bg-zinc-100 rounded transition-colors flex items-center justify-center"
              aria-label="Nächster Monat"
            >
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="space-y-0.5">
            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
              {["M", "D", "M", "D", "F", "S", "S"].map((dayLabel, idx) => (
                <div
                  key={idx}
                  className="text-[9px] font-medium text-zinc-500 text-center"
                >
                  {dayLabel}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {weeks.flat().map((weekDay, idx) => {
                const dateKey = format(weekDay, "yyyy-MM-dd");
                const dayAppointments = appointmentsByDate.get(dateKey) || [];
                const isCurrentMonth = isSameMonth(weekDay, calendarDate);
                const isTodayDate = isToday(weekDay);

                const baseStyles =
                  "aspect-square flex flex-col items-center justify-center text-[9px] rounded transition-colors relative";

                let stateStyles = "text-zinc-700 hover:bg-zinc-100";
                if (!isCurrentMonth) {
                  stateStyles = "text-zinc-300";
                } else if (isTodayDate) {
                  stateStyles = "bg-[var(--primary)] text-white font-semibold";
                } else if (dayAppointments.length > 0) {
                  stateStyles =
                    "bg-blue-50 text-blue-700 font-medium hover:bg-blue-100";
                }

                return (
                  <div
                    key={idx}
                    className={`${baseStyles} ${stateStyles} ${
                      dayAppointments.length > 0
                        ? "cursor-pointer"
                        : "cursor-default"
                    }`}
                    onClick={(event) =>
                      dayAppointments.length > 0
                        ? handleCalendarDayClick(event, dayAppointments)
                        : undefined
                    }
                  >
                    {format(weekDay, "d")}
                    {dayAppointments.length > 0 && (
                      <div className="absolute bottom-1 flex items-center gap-0.5">
                        {dayAppointments.slice(0, 3).map((appointment) => (
                          <span
                            key={appointment.id}
                            className="w-1.5 h-1.5 rounded-full border border-white shadow-sm"
                            style={{
                              backgroundColor: getSessionColor(appointment),
                            }}
                          />
                        ))}
                        {dayAppointments.length > 3 && (
                          <span className="text-[8px] text-zinc-500">
                            +{dayAppointments.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {footerContent && (
            <div className="pt-2 mt-2 border-t border-zinc-200">
              {footerContent}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [
    allSessions,
    calendarDate,
    handleCalendarDayClick,
    setCalendarDate,
    footerContent,
  ]);

  return calendarContent;
}
