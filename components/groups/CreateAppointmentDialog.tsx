import { useEffect, useState } from "react";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePickerCalendar } from "@/components/ui/DatePickerCalendar";
import { TimeInput } from "@/components/ui/TimeInput";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

export type AppointmentFormData = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  locationType: "online" | "on-campus";
};

type CreateAppointmentDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  groupName?: string;
  onSubmit: (data: AppointmentFormData) => void;
  disabled?: boolean;
};

const initialState: AppointmentFormData = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  locationType: "online",
};

export function CreateAppointmentDialog({
  isOpen,
  onOpenChange,
  groupName,
  onSubmit,
  disabled,
}: CreateAppointmentDialogProps) {
  const [formState, setFormState] = useState<AppointmentFormData>(initialState);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormState(initialState);
      setSelectedDate(undefined);
      setDatePickerOpen(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (
      !formState.title.trim() ||
      !formState.date ||
      !formState.startTime ||
      !formState.endTime
    ) {
      return;
    }
    onSubmit(formState);
    setFormState(initialState);
    setSelectedDate(undefined);
    setDatePickerOpen(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormState(initialState);
    setSelectedDate(undefined);
    setDatePickerOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>
            Termin hinzufügen {groupName ? `für ${groupName}` : ""}
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 hidden sm:block p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        <div className="p-4 sm:p-6 space-y-4 overflow-x-hidden min-w-0">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Titel
            </label>
            <Input
              type="text"
              value={formState.title}
              onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Coaching Termin"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Datum
            </label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
              disabled={disabled}
                  className="relative w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-left bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  {selectedDate ? (
                    format(selectedDate, "dd.MM.yyyy")
                  ) : (
                    <span className="text-zinc-400">Datum auswählen</span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-6" align="start">
                <DatePickerCalendar
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setFormState((prev) => ({
                      ...prev,
                      date: format(date, "yyyy-MM-dd"),
                    }));
                    setDatePickerOpen(false);
                  }}
                  minDate={new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Startzeit
              </label>
              <TimeInput
                value={formState.startTime}
                onChange={(time) =>
                  setFormState((prev) => ({ ...prev, startTime: time }))
                }
                disabled={disabled}
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Endzeit
              </label>
              <TimeInput
                value={formState.endTime}
                onChange={(time) =>
                  setFormState((prev) => ({ ...prev, endTime: time }))
                }
                disabled={disabled}
                placeholder=""
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Art</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({ ...prev, locationType: "online" }))
                }
                className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors ${
                  formState.locationType === "online"
                    ? "bg-[var(--primary)] text-white border-zinc-900"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                }`}
                disabled={disabled}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({ ...prev, locationType: "on-campus" }))
                }
                className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors ${
                  formState.locationType === "on-campus"
                    ? "bg-[var(--primary)] text-white border-zinc-900"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                }`}
                disabled={disabled}
              >
                Vor Ort
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              {formState.locationType === "on-campus" ? "Ort" : "Link (optional)"}
            </label>
            <Input
              type="text"
              value={formState.location}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder={
                formState.locationType === "on-campus"
                  ? "z.B. Raum B309"
                  : "z.B. Microsoft Teams Link"
              }
              disabled={disabled}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={
                disabled ||
                !formState.title.trim() ||
                !formState.date ||
                !formState.startTime ||
                !formState.endTime
              }
            >
              Erstellen
            </Button>
            <Button onClick={handleCancel} variant="secondary" className="flex-1">
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

