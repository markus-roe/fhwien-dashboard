"use client";

import { useEffect, useState } from "react";
import { X, Bug, Lightbulb, CheckCircle2 } from "lucide-react";
import type { ReportType } from "@/shared/lib/api-types";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { Input, Textarea } from "@/shared/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";

type SubmitReportDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { type: ReportType; title: string; description: string }) => Promise<void>;
};

const initialFormState = {
  type: "" as "" | ReportType,
  title: "",
  description: "",
};

export function SubmitReportDialog({
  isOpen,
  onOpenChange,
  onSubmit,
}: SubmitReportDialogProps) {
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialFormState);
      setError(null);
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!formState.type || !formState.title.trim() || !formState.description.trim()) {
      setError("Bitte fülle alle Felder aus.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      await onSubmit({
        type: formState.type,
        title: formState.title.trim(),
        description: formState.description.trim(),
      });
      setIsSuccess(true);
      setFormState(initialFormState);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Senden des Reports.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormState(initialFormState);
    setError(null);
    setIsSuccess(false);
    onOpenChange(false);
  };

  const isFormValid =
    formState.type &&
    formState.title.trim().length > 0 &&
    formState.description.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>Feature Request / Bug Report</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 hidden sm:block p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>
        <div className="p-4 sm:p-6 space-y-4 overflow-x-hidden min-w-0">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                Report erfolgreich eingereicht!
              </h3>
              <p className="text-sm text-zinc-600 mb-6">
                Vielen Dank für dein Feedback. Wir werden uns darum kümmern.
              </p>
              <Button
                onClick={handleCancel}
                className="w-full sm:w-auto min-w-[120px]"
              >
                Schließen
              </Button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Typ *
                </label>
                <Select
                  options={[
                    {
                      value: "feature_request",
                      label: "Feature Request",
                    },
                    {
                      value: "bug_report",
                      label: "Bug Report",
                    },
                  ]}
                  value={formState.type}
                  onChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      type: value as ReportType,
                    }))
                  }
                  placeholder="Typ auswählen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Titel *
                </label>
                <Input
                  type="text"
                  value={formState.title}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={
                    formState.type === "feature_request"
                      ? "z.B. Neue Funktion für..."
                      : "z.B. Problem beim..."
                  }
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Beschreibung *
                </label>
                <Textarea
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={
                    formState.type === "feature_request"
                      ? "Beschreibe die gewünschte Funktion im Detail..."
                      : "Beschreibe das Problem im Detail, inklusive Schritte zur Reproduktion..."
                  }
                  rows={6}
                  maxLength={2000}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  {formState.description.length}/2000 Zeichen
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={!isFormValid || isSubmitting}
                  icon={formState.type === "feature_request" ? Lightbulb : Bug}
                  iconPosition="left"
                >
                  {isSubmitting ? "Wird gesendet..." : "Senden"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Abbrechen
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
