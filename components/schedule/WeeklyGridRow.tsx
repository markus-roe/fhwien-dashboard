'use client'

import { SessionCard } from './SessionCard'

interface TimeSlot {
  time: string
  sessions: Array<{
    dayIndex: number
    session: {
      id: string
      type: 'lecture' | 'workshop' | 'coaching'
      title: string
      program: string
      location: string
      locationType: 'online' | 'on-campus'
      participants?: number
    }
  }>
}

interface WeeklyGridRowProps {
  timeSlot: TimeSlot
  onSessionClick?: (sessionId: string) => void
}

export const WeeklyGridRow = ({ timeSlot, onSessionClick }: WeeklyGridRowProps) => {
  const sessionsByDay = new Map<number, TimeSlot['sessions'][0]>()
  timeSlot.sessions.forEach((s) => {
    sessionsByDay.set(s.dayIndex, s)
  })

  return (
    <div className="grid grid-cols-7 min-h-[140px]">
      {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
        const sessionData = sessionsByDay.get(dayIndex)
        return (
          <div
            key={dayIndex}
            className={`p-2 relative ${dayIndex < 6 ? 'border-r border-zinc-100' : ''} overflow-hidden`}
          >
            {dayIndex === 0 && (
              <span className="text-[10px] text-zinc-300 font-medium font-mono absolute top-1.5 right-2">
                {timeSlot.time}
              </span>
            )}
            {sessionData ? (
              <SessionCard
                session={sessionData.session}
                onClick={() => onSessionClick?.(sessionData.session.id)}
              />
            ) : (
              dayIndex !== 0 && (
                <span className="text-[10px] text-zinc-300 font-medium font-mono absolute top-1.5 right-2">
                  {timeSlot.time}
                </span>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}

