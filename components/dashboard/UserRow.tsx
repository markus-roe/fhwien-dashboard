import { Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { User } from "@/data/mockData";

type UserRowProps = {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export function UserRow({ user, onEdit, onDelete }: UserRowProps) {
  return (
    <div className="group grid grid-cols-[1.4fr,0.9fr,0.8fr,auto] items-center gap-3 px-4 py-2.5 text-xs hover:bg-zinc-50 transition-colors">
      <div>
        <p className="font-medium text-zinc-900">{user.name}</p>
        <p className="text-xs text-zinc-500">{user.email}</p>
      </div>
      <div className="text-xs text-zinc-600">{user.program}</div>
      <div className="text-xs text-zinc-600 capitalize">
        {user.role ?? "student"}
      </div>
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
  );
}

