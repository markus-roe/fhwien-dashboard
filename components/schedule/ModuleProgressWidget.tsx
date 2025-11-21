interface ModuleProgressWidgetProps {
  progress: {
    percentage: number
    semester: string
    creditsEarned: number
    creditsTotal: number
  }
}

export const ModuleProgressWidget = ({ progress }: ModuleProgressWidgetProps) => {
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (progress.percentage / 100) * circumference

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
      <h3 className="text-sm font-medium text-zinc-900 mb-4">Modulfortschritt</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-zinc-100 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <circle
              className="text-zinc-900 progress-ring__circle stroke-current"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-sm font-bold text-zinc-900 tabular-nums">
              {progress.percentage}%
            </span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-zinc-900">{progress.semester}</p>
          <p className="text-[10px] text-zinc-500 mt-1">
            {progress.creditsEarned} von {progress.creditsTotal} Credits erworben
          </p>
          <a
            href="#"
            className="text-[10px] text-zinc-500 hover:text-zinc-900 underline decoration-zinc-300 underline-offset-2 mt-2 inline-block"
          >
            Details anzeigen
          </a>
        </div>
      </div>
    </div>
  )
}

