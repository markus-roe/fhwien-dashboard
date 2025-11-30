"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

type TabHeaderProps = {
  title: string;
  buttonLabel: string;
  buttonIcon: LucideIcon;
  onButtonClick: () => void;
};

export function TabHeader({
  title,
  buttonLabel,
  buttonIcon: Icon,
  onButtonClick,
}: TabHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 flex-1">
        {title}
      </h2>
      <Button
        size="sm"
        className="h-8 px-2 sm:px-3 text-xs shrink-0 w-full sm:w-auto"
        icon={Icon}
        iconPosition="left"
        onClick={onButtonClick}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
