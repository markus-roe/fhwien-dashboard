import { useEffect, useState } from "react";
import { X, Minus, Plus, Calendar } from "lucide-react";
import type { Course } from "@/data/mockData";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input, Textarea } from "@/components/ui/Input";
import { DatePickerCalendar } from "@/components/ui/DatePickerCalendar";
import { TimeInput } from "@/components/ui/TimeInput";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export type CreateCoachingSlotFormData = {
  courseId: string;
  date: Date;
  time: string;
  endTime: string;
  location: string;
  locationType: "online" | "on-campus";
  maxParticipants: number;
  description?: string;
};

type CreateCoachingSlotDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onSubmit: (data: CreateCoachingSlotFormData) => void;
};

const initialFormState: CreateCoachingSlotFormData = {
  courseId: "",
  date: new Date(),
  time: "",
  endTime: "",
  location: "",
  locationType: "on-campus",
  maxParticipants: 4,
  description: "",
};

export function CreateCoachingSlotDialog({
  isOpen,
  onOpenChange,
  courses,
  onSubmit,
}: CreateCoachingSlotDialogProps) {
  const [formState, setFormState] =
    useState<CreateCoachingSlotFormData>(initialFormState);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormState({
        ...initialFormState,
        date: new Date(),
      });
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (
      !formState.courseId ||
      !formState.time ||
      !formState.endTime ||
      !formState.location.trim()
    ) {
      return;
    }

    onSubmit(formState);
    setFormState(initialFormState);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormState(initialFormState);
    onOpenChange(false);
  };

  const isFormValid =
    formState.courseId &&
    formState.time &&
    formState.endTime &&
    formState.location.trim() &&
    formState.maxParticipants > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neuen Coaching-Slot erstellen</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Fach
            </label>
            <Select
              options={[
                { value: "", label: "Fach auswählen" },
                ...courses.map((course) => ({
                  value: course.id,
                  label: course.title,
                })),
              ]}
              value={formState.courseId}
              onChange={(value) =>
                setFormState((prev) => ({ ...prev, courseId: value }))
              }
              placeholder="Fach auswählen"
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
                  className="w-full pl-3 pr-10 py-2 border border-zinc-200 rounded-lg text-left bg-white hover:border-zinc-300 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span
                    className={
                      formState.date ? "text-zinc-900" : "text-zinc-400"
                    }
                  >
                    {formState.date
                      ? format(formState.date, "EEEE, d. MMMM yyyy", {
                          locale: de,
                        })
                      : "Datum auswählen"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DatePickerCalendar
                  selected={formState.date}
                  onSelect={(date) => {
                    setFormState((prev) => ({ ...prev, date }));
                    setDatePickerOpen(false);
                  }}
                  minDate={new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Startzeit
              </label>
              <TimeInput
                value={formState.time}
                onChange={(time) => setFormState((prev) => ({ ...prev, time }))}
                placeholder="Startzeit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Endzeit
              </label>
              <TimeInput
                value={formState.endTime}
                onChange={(endTime) =>
                  setFormState((prev) => ({ ...prev, endTime }))
                }
                placeholder="Endzeit"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Ort
            </label>
            <Input
              type="text"
              value={formState.location}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="z.B. B309 oder Microsoft Teams"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Art des Ortes
            </label>
            <Select
              options={[
                { value: "on-campus", label: "Vor Ort" },
                { value: "online", label: "Online" },
              ]}
              value={formState.locationType}
              onChange={(value) =>
                setFormState((prev) => ({
                  ...prev,
                  locationType: value as "online" | "on-campus",
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Maximale Teilnehmer
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    maxParticipants: Math.max(1, prev.maxParticipants - 1),
                  }))
                }
                className="p-2 border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                disabled={formState.maxParticipants === 1}
                aria-label="Verringern"
              >
                <Minus className="w-4 h-4 text-zinc-600" />
              </button>
              <Input
                type="number"
                value={formState.maxParticipants}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10) || 1;
                  setFormState((prev) => ({
                    ...prev,
                    maxParticipants: Math.max(1, value),
                  }));
                }}
                min="1"
                className="flex-1 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    maxParticipants: prev.maxParticipants + 1,
                  }))
                }
                className="p-2 border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-colors shrink-0"
                aria-label="Erhöhen"
              >
                <Plus className="w-4 h-4 text-zinc-600" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Beschreibung (optional)
            </label>
            <Textarea
              value={formState.description}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Beschreibung des Coaching-Slots..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!isFormValid}
            >
              Erstellen
            </Button>
            <Button
              onClick={handleCancel}
              variant="secondary"
              className="flex-1"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
