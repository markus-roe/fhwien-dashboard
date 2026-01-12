"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Input, Textarea } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Button } from "@/shared/components/ui/Button";
import { DateTimePickerSection } from "@/shared/components/ui/DateTimePickerSection";
import type { LocationType, Course } from "@/shared/lib/api-types";
import { format } from "date-fns";

import type { EditSessionFormState } from "@/features/dashboard/types";

type EditSessionDialogProps = {
  formState: EditSessionFormState;
  onFormStateChange: (state: EditSessionFormState) => void;
  onSave: () => void;
  onClose: () => void;
  mode: "edit" | "create";
  courses: Course[];
};

export function EditSessionDialog({
  formState,
  onFormStateChange,
  onSave,
  onClose,
  mode,
  courses,
}: EditSessionDialogProps) {
  const isFormValid =
    formState.courseId &&
    formState.title.trim() &&
    formState.time &&
    formState.endTime &&
    formState.location.trim();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden mx-2 sm:mx-4">
        <DialogHeader onClose={onClose}>
          <DialogTitle>
            {mode === "edit" ? "Termin bearbeiten" : "Neuen Termin anlegen"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-3 sm:p-4 md:p-6 overflow-x-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[270px,1fr] gap-4 md:gap-8 min-w-0">
            {/* Left: Date & Time */}
            <DateTimePickerSection
              date={formState.date}
              time={formState.time}
              endTime={formState.endTime}
              onDateChange={(date) => onFormStateChange({ ...formState, date })}
              onTimeChange={(time) => onFormStateChange({ ...formState, time })}
              onEndTimeChange={(endTime) =>
                onFormStateChange({ ...formState, endTime })
              }
            />

            {/* Right: All other fields */}
            <div className="space-y-4 md:pl-6 md:border-l md:border-zinc-200">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Lehrveranstaltung
                </label>
                <Select
                  options={courses.map((course) => ({
                    value: course.id.toString(),
                    label: course.title,
                  }))}
                  value={formState.courseId?.toString() || ""}
                  onChange={(value) => {
                    const course = courses.find((c) => c.id === parseInt(value));
                    onFormStateChange({
                      ...formState,
                      courseId: parseInt(value) || null,
                      title: course?.title
                        ? course?.title + " LV"
                        : formState.title + " LV",
                    });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Titel
                </label>
                <Input
                  value={formState.title}
                  onChange={(e) =>
                    onFormStateChange({ ...formState, title: e.target.value })
                  }
                />
              </div>

              {/* Mobile: Native date input */}
              <label className="md:hidden block text-sm font-medium text-zinc-700 mb-1">
                Datum
              </label>
              <div className="md:hidden w-full py-1.5 border border-zinc-200 rounded-lg bg-white text-zinc-900 transition-all">
                <input
                  type="date"
                  value={format(formState.date, "yyyy-MM-dd")}
                  onChange={(e) => {
                    const selectedDate = e.target.value
                      ? new Date(e.target.value)
                      : new Date();
                    onFormStateChange({
                      ...formState,
                      date: selectedDate,
                    });
                  }}
                  className="md:hidden w-full bg-white text-zinc-900 transition-all"
                />
              </div>
              {/* Mobile: Startzeit and Endzeit in 2 columns */}
              <div className="md:hidden grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Startzeit
                  </label>
                  <div className="w-full py-1.5 border border-zinc-200 rounded-lg bg-white text-zinc-900 transition-all">
                    <input
                      type="time"
                      value={formState.time}
                      onChange={(e) =>
                        onFormStateChange({
                          ...formState,
                          time: e.target.value,
                        })
                      }
                      className="w-full bg-white text-zinc-900 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Endzeit
                  </label>
                  <div className="w-full py-1.5 border border-zinc-200 rounded-lg bg-white text-zinc-900 transition-all">
                    <input
                      type="time"
                      value={formState.endTime}
                      onChange={(e) =>
                        onFormStateChange({
                          ...formState,
                          endTime: e.target.value,
                        })
                      }
                      className="w-full bg-white text-zinc-900 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Ort
                </label>
                <Input
                  value={formState.location}
                  onChange={(e) =>
                    onFormStateChange({
                      ...formState,
                      location: e.target.value,
                    })
                  }
                  placeholder="z.B. B309 oder Microsoft Teams"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Art des Ortes
                  </label>
                  <Select
                    options={[
                      { value: "on_campus", label: "Vor Ort" },
                      { value: "online", label: "Online" },
                    ]}
                    value={formState.locationType}
                    onChange={(value) =>
                      onFormStateChange({
                        ...formState,
                        locationType: value as LocationType,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Anwesenheit
                  </label>
                  <Select
                    options={[
                      { value: "mandatory", label: "Verpflichtend" },
                      { value: "optional", label: "Optional" },
                    ]}
                    value={formState.attendance}
                    onChange={(value) =>
                      onFormStateChange({
                        ...formState,
                        attendance: value as "mandatory" | "optional",
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Notizen (optional)
                </label>
                <Textarea
                  value={formState.notes}
                  onChange={(e) =>
                    onFormStateChange({ ...formState, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-zinc-200">
            <Button
              className="w-full sm:flex-1 order-2 sm:order-1"
              disabled={!isFormValid}
              onClick={onSave}
            >
              {mode === "edit" ? "Speichern" : "Anlegen"}
            </Button>
            <Button
              className="w-full sm:flex-1 order-1 sm:order-2"
              variant="secondary"
              onClick={onClose}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
