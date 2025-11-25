import { ChevronDown, ChevronUp } from "lucide-react";
import type { Course, Group } from "@/data/mockData";
import { Button } from "@/components/ui/Button";
import { GroupMembersList } from "./GroupMembersList";

type MyGroupCardProps = {
  group: Group;
  course?: Course;
  isExpanded: boolean;
  onToggle: () => void;
  onLeaveGroup: () => void;
};

export function MyGroupCard({
  group,
  course,
  isExpanded,
  onToggle,
  onLeaveGroup,
}: MyGroupCardProps) {
  return (
    <div className="border border-zinc-200 rounded-lg hover:border-zinc-300 transition-all overflow-hidden">
      <button onClick={onToggle} className="w-full">
        <div className="p-2.5 sm:p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 mb-0.5">
                {group.name}
              </h3>
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-zinc-500">
                <span>
                  {group.members.length}
                  {group.maxMembers ? ` / ${group.maxMembers}` : ""} Mitglieder
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-2.5 sm:px-2.5 pt-0 pb-2 sm:pb-2.5 space-y-2 border-t border-zinc-100">
          <GroupMembersList members={group.members} />

          <div className="pt-1.5 border-t border-zinc-100">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onLeaveGroup();
              }}
              variant="ghost"
              className="w-full text-[9px] sm:text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 h-6"
            >
              Gruppe verlassen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

