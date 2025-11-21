'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { WeeklyGridHeader } from './WeeklyGridHeader'
import { WeeklyGridRow } from './WeeklyGridRow'
import { ListView } from './ListView'
import { Tabs, Tab } from '../ui/Tabs'
import type { Session } from '@/data/mockData'

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

interface WeeklyGridProps {
  weekDays: Date[]
  timeSlots: TimeSlot[]
  sessions: Session[]
  viewMode?: 'week' | 'list'
  onViewModeChange?: (mode: 'week' | 'list') => void
  onSessionClick?: (sessionId: string) => void
  weekRange?: string
  onPreviousWeek?: () => void
  onNextWeek?: () => void
  onToday?: () => void
}

export const WeeklyGrid = ({
  weekDays,
  timeSlots,
  sessions,
  viewMode = 'week',
  onViewModeChange,
  onSessionClick,
  weekRange,
  onPreviousWeek,
  onNextWeek,
  onToday
}: WeeklyGridProps) => {
  // Find current day index in the week
  const today = new Date()
  const todayDay = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()
  
  const currentDayIndex = weekDays.findIndex((day) => {
    return (
      day.getDate() === todayDay &&
      day.getMonth() === todayMonth &&
      day.getFullYear() === todayYear
    )
  })

  // Calculate current time position (mock for now - can be enhanced to show actual time)
  const currentTime = today.toTimeString().slice(0, 5) // HH:MM format
  const rowHeight = 140 // min-h-[140px]
  const currentTimePosition = 165 // Approximate position, can be calculated more precisely

  return (
    <section className="lg:col-span-9 h-full flex flex-col">
      <div className="flex flex-col items-center mb-4 gap-3">
        {/* Datepicker - centered */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-zinc-200 shadow-sm">
          <button
            onClick={onPreviousWeek}
            className="p-1.5 hover:bg-zinc-50 rounded-md text-zinc-500 hover:text-zinc-900 transition-colors"
            aria-label="Vorherige Woche"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-zinc-900 px-3 tabular-nums min-w-[140px] text-center">
            {weekRange}
          </span>
          <button
            onClick={onNextWeek}
            className="p-1.5 hover:bg-zinc-50 rounded-md text-zinc-500 hover:text-zinc-900 transition-colors"
            aria-label="Nächste Woche"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-zinc-200 mx-1"></div>
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-colors whitespace-nowrap"
          >
            Heute
          </button>
        </div>
        {/* Tabs - centered */}
        <Tabs>
          <Tab active={viewMode === 'week'} onClick={() => onViewModeChange?.('week')}>
            Wochenansicht
          </Tab>
          <Tab active={viewMode === 'list'} onClick={() => onViewModeChange?.('list')}>
            Listenansicht
          </Tab>
        </Tabs>
      </div>

      {/* Grid Container */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col relative">
        {viewMode === 'week' ? (
          <>
            <WeeklyGridHeader weekDays={weekDays} />

            {/* Scrollable Grid Area */}
            <div className="overflow-y-auto overflow-x-auto relative flex-1 min-h-[500px]">
              {/* Current Time Indicator */}
              {currentDayIndex >= 0 && (
                <div className="absolute top-[165px] left-0 right-0 z-20 pointer-events-none flex items-center group">
                  {/* Days before current day */}
                  <div style={{ width: `${(currentDayIndex / 7) * 100}%` }} className="border-t border-red-500/30"></div>
                  {/* Current day column */}
                  <div style={{ width: `${(1 / 7) * 100}%` }} className="border-t border-red-500 relative">
                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                    <div className="absolute -left-12 -top-2.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {currentTime}
                    </div>
                  </div>
                  {/* Days after current day */}
                  <div style={{ width: `${((7 - currentDayIndex - 1) / 7) * 100}%` }} className="border-t border-red-500/30"></div>
                </div>
              )}

              {/* Rows */}
              <div className="divide-y divide-zinc-100 min-w-[600px] lg:min-w-0">
                {timeSlots.map((timeSlot, index) => (
                  <WeeklyGridRow
                    key={timeSlot.time}
                    timeSlot={timeSlot}
                    onSessionClick={onSessionClick}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <ListView sessions={sessions} weekDays={weekDays} onSessionClick={onSessionClick} />
        )}
      </div>
    </section>
  )
}

