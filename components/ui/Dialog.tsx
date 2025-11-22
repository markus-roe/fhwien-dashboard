import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
};

export const DialogContent = ({
  children,
  className = "",
}: DialogContentProps) => {
  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-md mx-auto ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

export const DialogHeader = ({ children }: DialogHeaderProps) => {
  return <div className="p-4 sm:p-6 border-b border-zinc-200 relative">{children}</div>;
};

export const DialogTitle = ({
  children,
  className = "",
}: DialogTitleProps) => {
  return (
    <h2 className={`text-lg sm:text-xl font-semibold text-zinc-900 ${className}`}>
      {children}
    </h2>
  );
};

