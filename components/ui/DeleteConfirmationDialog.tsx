import React from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

type DeleteConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  itemName?: string;
  itemDetails?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemDetails,
  confirmLabel = "Löschen",
  cancelLabel = "Abbrechen",
}: DeleteConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader onClose={onClose}>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 px-6 py-2">
          {description && (
            <p className="text-sm text-zinc-600">{description}</p>
          )}
          {(itemName || itemDetails) && (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
              {itemName && (
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {itemName}
                </p>
              )}
              {itemDetails && (
                <div className="text-xs text-zinc-500 mt-0.5">
                  {itemDetails}
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-zinc-500">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-3 pt-2">
          <Button
            className="flex-1"
            variant="secondary"
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

