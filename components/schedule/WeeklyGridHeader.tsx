import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface WeeklyGridHeaderProps {
  weekDays: Date[]
}

export const WeeklyGridHeader = ({ weekDays }: WeeklyGridHeaderProps) => {
  const today = new Date()
  const todayDate = today.getDate()

  return (
    <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/50">
      {weekDays.map((day, index) => {
        const isToday = day.getDate() === todayDate && day.getMonth() === today.getMonth()
        return (
          <div
            key={index}
            className={`p-3 text-center ${
              index < weekDays.length - 1 ? 'border-r border-zinc-100' : ''
            } ${isToday ? 'bg-blue-50/30' : ''}`}
          >
            <span
              className={`block text-[10px] font-semibold uppercase tracking-wider ${
                isToday ? 'text-blue-600' : 'text-zinc-500'
              }`}
            >
              {format(day, 'EEE', { locale: de })}
            </span>
            <span className="block text-sm font-semibold text-zinc-900 mt-0.5">
              {format(day, 'd')}
            </span>
          </div>
        )
      })}
    </div>
  )
}

