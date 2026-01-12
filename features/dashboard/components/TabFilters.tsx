"use client";

import { ReactNode } from "react";
import { Input } from "@/shared/components/ui/Input";
import { SearchIcon } from "lucide-react";

type TabFiltersProps = {
  leftFilter: ReactNode;
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function TabFilters({
  leftFilter,
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}: TabFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,280px),minmax(0,1fr)]">
      {leftFilter}
      <div>
        <label className="block text-xs font-medium text-zinc-600 mb-1">
          {searchLabel}
        </label>
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
}
