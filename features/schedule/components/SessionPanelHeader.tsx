import { X } from "lucide-react";
import type { Session } from "@/shared/data/mockData";
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

  const courseLabel = session.courseId?.toUpperCase?.()
    ? session.courseId.toUpperCase()
    : session.courseId;
  const metaLabel = session.courseId
    ? `${session.courseId} • ${courseLabel}`
    : courseLabel;

  return (
    <div className="px-8 py-6 border-b border-zinc-100 flex items-start justify-between bg-white sticky top-0 z-10">
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Badge variant={getBadgeVariant()}>{typeLabels[session.type]}</Badge>
          <span className="text-zinc-400 text-xs font-medium">{metaLabel}</span>
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
