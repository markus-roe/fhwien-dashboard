"use client";

import { Badge } from "@/shared/components/ui/Badge";
import type { User } from "@/shared/lib/api-types";

type MemberBadgeProps = {
  member: User;
  onRemove?: (memberId: number) => void;
};

export function MemberBadge({ member, onRemove }: MemberBadgeProps) {
  return (
    <Badge
      rounded="md"
      variant="default"
      size="sm"
      className="normal-case font-normal inline-flex items-center gap-1"
    >
      {member.name}
      {onRemove && (
        <button
          type="button"
          className="text-zinc-400 hover:text-zinc-700 transition-colors ml-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(member.id);
          }}
        >
          <span className="sr-only">{member.name} entfernen</span>×
        </button>
      )}
    </Badge>
  );
}
