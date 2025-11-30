"use client";

import { Plus } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { TabFilters } from "./TabFilters";
import { TabHeader } from "./TabHeader";
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
  loading?: boolean;
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
  loading = false,
}: UsersTabProps) {
  return (
    <div className="space-y-5">
      <TabFilters
        leftFilter={
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              Programm auswählen
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
        }
        searchLabel="Student suchen"
        searchPlaceholder="Name oder E-Mail"
        searchValue={userSearch}
        onSearchChange={onUserSearchChange}
      />

      <TabHeader
        title="Studenten"
        buttonLabel="Neuer Student"
        buttonIcon={Plus}
        onButtonClick={onCreate}
      />

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
        loading={loading}
      />
    </div>
  );
}
