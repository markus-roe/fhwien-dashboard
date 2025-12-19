import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-lg border border-zinc-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }: CardHeaderProps) => {
  return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className = "" }: CardContentProps) => {
  return <div className={`${className}`}>{children}</div>;
};
