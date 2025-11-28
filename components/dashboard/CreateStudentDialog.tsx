import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { User, Program, UserRole } from "@/data/mockData";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

export type CreateStudentFormData = {
  name: string;
  email: string;
  program: Program;
  role: UserRole;
  initials: string;
};

type CreateStudentDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateStudentFormData) => void;
  mode?: "create" | "edit";
  initialData?: User;
};

function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    // Nur ein Wort: Erste 2 Buchstaben
    return parts[0].substring(0, 2).toUpperCase();
  }
  // Mehrere Wörter: Erster Buchstabe jedes Wortes
  return parts
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

const initialFormState: CreateStudentFormData = {
  name: "",
  email: "",
  program: "DTI",
  role: "student",
  initials: "",
};

export function CreateStudentDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  mode = "create",
  initialData,
}: CreateStudentDialogProps) {
  const [formState, setFormState] =
    useState<CreateStudentFormData>(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormState({
          name: initialData.name,
          email: initialData.email,
          program: initialData.program,
          role: "student",
          initials: generateInitials(initialData.name),
        });
      } else {
        setFormState(initialFormState);
      }
    }
  }, [isOpen, mode, initialData]);

  const handleNameChange = (value: string) => {
    setFormState((prev) => {
      const newInitials = generateInitials(value);
      return {
        ...prev,
        name: value,
        initials: newInitials,
      };
    });
  };

  const handleSubmit = () => {
    if (!formState.name.trim() || !formState.email.trim()) return;
    onSubmit(formState);
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
          <DialogTitle>
            {mode === "edit" ? "Student bearbeiten" : "Neuer Student"}
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
              Name
            </label>
            <Input
              type="text"
              value={formState.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Max Mustermann"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              E-Mail
            </label>
            <Input
              type="email"
              value={formState.email}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="max.mustermann@fhwien.ac.at"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Programm
            </label>
            <Select
              options={[
                { value: "DTI", label: "DTI" },
                { value: "DI", label: "DI" },
              ]}
              value={formState.program}
              onChange={(value) =>
                setFormState((prev) => ({
                  ...prev,
                  program: value as Program,
                }))
              }
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!formState.name.trim() || !formState.email.trim()}
            >
              {mode === "edit" ? "Speichern" : "Erstellen"}
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
