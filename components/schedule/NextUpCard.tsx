'use client'

import { Clock, Video, ArrowRight, MapPin } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface NextUpCardProps {
  session: {
    title: string
    subtitle: string
    program: string
    date: string
    time: string
    endTime: string
    location: string
    locationType: 'online' | 'on-campus'
    isLive: boolean
  }
  onOpenPanel?: () => void
}

export const NextUpCard = ({ session, onOpenPanel }: NextUpCardProps) => {
  return (
    <section className="mb-6">
      <div
        onClick={onOpenPanel}
        className="group cursor-pointer relative w-full bg-white rounded-lg border border-zinc-200 p-4 md:p-5 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-zinc-300"
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {session.isLive && (
                <Badge variant="blue" className="flex items-center gap-1.5 text-xs">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                  </span>
                  Jetzt live
                </Badge>
              )}
              <span className="text-zinc-400 text-xs font-normal">{session.date}</span>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 leading-tight group-hover:text-blue-600 transition-colors">
                {session.title}
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5 font-normal">
                {session.subtitle} • {session.program} Programm
              </p>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-zinc-600">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-medium tabular-nums">
                  {session.time} – {session.endTime}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-600">
                {session.locationType === 'online' ? (
                  <Video className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                )}
                <span className="text-xs font-medium">{session.location}</span>
              </div>
            </div>
          </div>

          {session.locationType === 'online' ? (
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <Button className="w-full md:w-auto px-4 py-2 text-sm" icon={ArrowRight}>
                Session beitreten
              </Button>
            </div>
          ) : (
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <Button className="w-full md:w-auto px-4 py-2 text-sm" icon={ArrowRight}>
                Details ansehen
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

