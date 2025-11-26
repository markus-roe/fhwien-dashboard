import { ButtonHTMLAttributes, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  icon: Icon,
  iconPosition = "right",
  className = "",
  size = "md",
  disabled = false,
  ...props
}: ButtonProps) => {
  const baseClasses =
    "w-full md:w-auto px-4 py-2 text-sm flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm cursor-pointer";

  const variantClasses = {
    primary: "bg-[#012f64] hover:bg-[#012f64]/80 text-white",
    secondary:
      "bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700",
    ghost: "bg-transparent hover:bg-zinc-50 text-zinc-700",
    destructive: "bg-red-500 hover:bg-red-600 text-white",
  };

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconElement = Icon && <Icon className="w-4 h-4" />;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
      {...props}
    >
      {iconPosition === "left" && iconElement}
      {children}
      {iconPosition === "right" && iconElement}
    </button>
  );
};
