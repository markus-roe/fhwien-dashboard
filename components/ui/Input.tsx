"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: LucideIcon;
  error?: boolean;
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none z-10" />
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
            "bg-white text-zinc-900 placeholder:text-zinc-400",
            "transition-all hover:border-zinc-300",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            Icon && "pl-10",
            error && "border-red-300 focus:ring-red-500",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-3 py-2 border rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent",
          "bg-white text-zinc-900 placeholder:text-zinc-400",
          "transition-all hover:border-zinc-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "resize-y min-h-[80px]",
          error && "border-red-300 focus:ring-red-500",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

