import { Mail } from "lucide-react";
import type { Group } from "@/data/mockData";
import { Avatar } from "@/components/ui/Avatar";

type GroupMembersListProps = {
  members: Group["members"];
};

export function GroupMembersList({ members }: GroupMembersListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-[9px] sm:text-[10px] font-medium text-zinc-500">
          Mitglieder
        </h4>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-1 hover:bg-zinc-50 p-1 rounded-md transition-colors"
          >
            <Avatar initials={member.initials} className="w-4 h-4 text-[9px]" />
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] text-zinc-700">
                {member.name}
              </span>
              <a
                href={`mailto:${member.email}`}
                className="text-[8px] sm:text-[9px] text-zinc-500 hover:text-[var(--primary)] flex items-center gap-0.5 transition-colors"
              >
                <Mail className="w-2 h-2" />
                {member.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
