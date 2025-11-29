import { History, ChevronDown, ChevronUp } from "lucide-react";

type PastItemsToggleProps = {
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
};

export function PastItemsToggle({
  count,
  isOpen,
  onToggle,
  label,
  className = "",
}: PastItemsToggleProps) {
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors text-xs font-medium text-zinc-600 ${className}`}
    >
      <History className="w-4 h-4 text-zinc-400" />
      <span>
        {label} ({count})
      </span>
      {isOpen ? (
        <ChevronUp className="w-4 h-4 text-zinc-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      )}
    </button>
  );
}
