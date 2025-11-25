import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?:
    | "default"
    | "blue"
    | "purple"
    | "emerald"
    | "amber"
    | "rose"
    | "red";
  className?: string;
  rounded?: "full" | "lg" | "md" | "sm";
  size?: "xs" | "sm" | "md" | "lg";
}

export const Badge = ({
  children,
  variant = "default",
  size = "xs",
  className = "",
  rounded = "full",
}: BadgeProps) => {
  const baseClasses = "px-2.5 py-1 font-medium tracking-wide uppercase border";
  const sizeClasses = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  const roundedClasses = {
    full: "rounded-full",
    lg: "rounded-lg",
    md: "rounded-md",
    sm: "rounded-sm",
  };
  const variantClasses = {
    default: "bg-zinc-100 text-zinc-600 border-zinc-200",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClasses[rounded]} ${className}`}>
      {children}
    </span>
  );
};
