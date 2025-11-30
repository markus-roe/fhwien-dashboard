"use client";

import { Badge } from "@/components/ui/Badge";

type MemberBadgeProps = {
  member: string;
  onRemove?: (member: string) => void;
};

export function MemberBadge({ member, onRemove }: MemberBadgeProps) {
  return (
    <Badge
      rounded="md"
      variant="default"
      size="sm"
      className="normal-case font-normal inline-flex items-center gap-1"
    >
      {member}
      {onRemove && (
        <button
          type="button"
          className="text-zinc-400 hover:text-zinc-700 transition-colors ml-0.5"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(member);
          }}
        >
          <span className="sr-only">{member} entfernen</span>×
        </button>
      )}
    </Badge>
  );
}
