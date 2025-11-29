"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { DataTable } from "./DataTable";
import { UserRow } from "./UserRow";
import { UserCard } from "./UserCard";
import type { User, Program } from "@/data/mockData";

type UsersTabProps = {
  users: User[];
  filteredUsers: User[];
  programFilter: Program | "all";
  userSearch: string;
  onProgramFilterChange: (filter: Program | "all") => void;
  onUserSearchChange: (search: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onCreate: () => void;
};

export function UsersTab({
  users,
  filteredUsers,
  programFilter,
  userSearch,
  onProgramFilterChange,
  onUserSearchChange,
  onEdit,
  onDelete,
  onCreate,
}: UsersTabProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,280px),minmax(0,1fr)]">
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Programm filtern
          </label>
          <Select
            options={[
              { value: "all", label: "Alle Programme" },
              { value: "DTI", label: "DTI" },
              { value: "DI", label: "DI" },
            ]}
            value={programFilter}
            onChange={(value) =>
              onProgramFilterChange(value as Program | "all")
            }
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">
            Student suchen
          </label>
          <Input
            value={userSearch}
            onChange={(e) => onUserSearchChange(e.target.value)}
            placeholder="Name oder E-Mail"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 flex-1">
          Studenten
        </h2>
        <Button
          size="sm"
          className="h-8 px-2 sm:px-3 text-xs shrink-0 w-full sm:w-auto"
          icon={Plus}
          iconPosition="left"
          onClick={onCreate}
        >
          Neuer Student
        </Button>
      </div>

      <DataTable
        items={filteredUsers}
        emptyMessage="Keine User gefunden."
        headerColumns={["User", "Programm", "Rolle", ""]}
        gridCols="grid-cols-[1.4fr,0.9fr,0.8fr,auto]"
        renderRow={(user) => (
          <UserRow
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
        renderCard={(user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      />
    </div>
  );
}
