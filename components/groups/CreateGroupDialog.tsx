import { useEffect, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import type { Course } from "@/data/mockData";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input, Textarea } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

export type CreateGroupFormData = {
  courseId: string;
  name: string;
  description?: string;
  maxMembers?: number;
};

type CreateGroupDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  defaultCourseId: string | null;
  onCoursePrefill?: (courseId: string | null) => void;
  onSubmit: (data: CreateGroupFormData) => void;
};

const initialFormState: CreateGroupFormData = {
  courseId: "",
  name: "",
  description: "",
  maxMembers: 5,
};

export function CreateGroupDialog({
  isOpen,
  onOpenChange,
  courses,
  defaultCourseId,
  onCoursePrefill,
  onSubmit,
}: CreateGroupDialogProps) {
  const [formState, setFormState] = useState<CreateGroupFormData>(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setFormState((prev) => ({
        ...initialFormState,
        courseId: defaultCourseId || "",
      }));
    }
  }, [defaultCourseId, isOpen]);

  const handleCourseChange = (value: string) => {
    setFormState((prev) => ({ ...prev, courseId: value }));
    if (onCoursePrefill) {
      onCoursePrefill(value || null);
    }
  };

  const handleSubmit = () => {
    if (!formState.name.trim() || !(formState.courseId || defaultCourseId)) return;
    onSubmit({
      ...formState,
      courseId: formState.courseId || defaultCourseId || "",
      maxMembers: formState.maxMembers ? Number(formState.maxMembers) : undefined,
    });
    setFormState(initialFormState);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormState(initialFormState);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>Neue Gruppe erstellen</DialogTitle>
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
            <label className="block text-sm font-medium text-zinc-700 mb-1">Fach</label>
            <Select
              options={[
                { value: "", label: "Fach auswählen" },
                ...courses.map((course) => ({
                  value: course.id,
                  label: course.title,
                })),
              ]}
              value={formState.courseId || defaultCourseId || ""}
              onChange={handleCourseChange}
              placeholder="Fach auswählen"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Gruppenname
            </label>
            <Input
              type="text"
              value={formState.name}
              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="z.B. Gruppe A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Beschreibung (optional)
            </label>
            <Textarea
              value={formState.description}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Beschreibung der Gruppe..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Maximale Mitglieder (optional)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    maxMembers: Math.max(1, (prev.maxMembers || 5) - 1),
                  }))
                }
                className="p-2 border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                disabled={formState.maxMembers === 1}
                aria-label="Verringern"
              >
                <Minus className="w-4 h-4 text-zinc-600" />
              </button>
              <Input
                type="number"
                value={formState.maxMembers ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormState((prev) => ({
                    ...prev,
                    maxMembers: value === "" ? undefined : Math.max(1, parseInt(value, 10) || 1),
                  }));
                }}
                min="1"
                className="flex-1 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                placeholder="Unbegrenzt"
              />
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    maxMembers: (prev.maxMembers || 0) + 1,
                  }))
                }
                className="p-2 border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-colors shrink-0"
                aria-label="Erhöhen"
              >
                <Plus className="w-4 h-4 text-zinc-600" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Leer lassen für unbegrenzt
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!formState.name.trim() || !(formState.courseId || defaultCourseId)}
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

