import { X } from "lucide-react";
import type { Session } from "@/shared/lib/api-types";
import { Badge } from "@/shared/components/ui/Badge";

interface SessionPanelHeaderProps {
  session: Session;
  onClose: () => void;
}

export const SessionPanelHeader = ({
  session,
  onClose,
}: SessionPanelHeaderProps) => {
  const typeLabels = {
    lecture: "Vorlesung",
    workshop: "Workshop",
    coaching: "Coaching",
  };

  const getBadgeVariant = () => {
    if (session.type === "lecture" && session.locationType === "online") {
      return "blue";
    }
    if (session.type === "lecture" || session.type === "workshop") {
      return "blue";
    }
    return "amber";
  };

  return (
    <div className="px-8 py-6 border-b border-zinc-100 flex items-start justify-between bg-white sticky top-0 z-10">
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Badge variant={getBadgeVariant()}>{typeLabels[session.type]}</Badge>
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 leading-tight">
          {session.title}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="p-2 -mr-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-900 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
