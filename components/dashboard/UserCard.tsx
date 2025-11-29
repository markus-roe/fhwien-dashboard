import { Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { User } from "@/data/mockData";

type UserCardProps = {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <div className="border border-zinc-100 rounded-lg p-3 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] text-xs">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-zinc-900">{user.name}</div>
          <div className="text-zinc-500">{user.email}</div>
          <div className="mt-1 text-zinc-600">Programm: {user.program}</div>
          <div className="text-zinc-600">Rolle: {user.role ?? "student"}</div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(user)}
            title="Bearbeiten"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 w-7 p-0"
            onClick={() => onDelete(user)}
            title="Löschen"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
