"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue | undefined>(
  undefined
);

function Popover({ children, open: controlledOpen, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  );
}

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within a Popover");
  }
  return context;
}

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

function PopoverTrigger({
  asChild,
  children,
  className,
  ...props
}: PopoverTriggerProps) {
  const { open, setOpen } = usePopoverContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      "data-popover-trigger": true,
      onClick: (e: React.MouseEvent) => {
        setOpen(!open);
        children.props.onClick?.(e);
      },
    } as any);
  }

  return (
    <button
      type="button"
      data-popover-trigger
      onClick={() => setOpen(!open)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
}

function PopoverContent({
  children,
  className,
  align = "start",
  side = "bottom",
  ...props
}: PopoverContentProps) {
  const { open, setOpen } = usePopoverContext();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    // Find the trigger element
    const trigger = contentRef.current?.parentElement?.querySelector('[data-popover-trigger]') as HTMLElement;
    triggerRef.current = trigger || null;
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    // Use setTimeout to avoid immediate click events
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, setOpen]);

  React.useEffect(() => {
    if (!open || !contentRef.current || !triggerRef.current) return;

    const updatePosition = () => {
      const content = contentRef.current;
      const trigger = triggerRef.current;
      if (!content || !trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      if (side === "bottom") {
        top = triggerRect.bottom + window.scrollY + 8;
      } else if (side === "top") {
        top = triggerRect.top + window.scrollY - contentRect.height - 8;
      } else {
        top = triggerRect.top + window.scrollY;
      }

      if (align === "start") {
        left = triggerRect.left + window.scrollX;
      } else if (align === "end") {
        left = triggerRect.right + window.scrollX - contentRect.width;
      } else {
        left = triggerRect.left + window.scrollX + (triggerRect.width - contentRect.width) / 2;
      }

      content.style.position = "fixed";
      content.style.top = `${top}px`;
      content.style.left = `${left}px`;
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align, side]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "fixed z-[100] w-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Popover, PopoverTrigger, PopoverContent };

