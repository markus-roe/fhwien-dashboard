type CourseFilterButtonProps = {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
};

export function CourseFilterButton({
  label,
  count,
  isActive,
  onClick,
}: CourseFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-md text-[12px] font-medium border transition-colors flex items-center justify-between gap-1.5 ${
        isActive
          ? "bg-[var(--primary)] text-white border-transparent shadow-sm"
          : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
      }`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs shrink-0 ${
          isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
