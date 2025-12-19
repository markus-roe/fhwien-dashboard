'use client'

import type { Session } from '@/shared/data/mockData'
import { SessionPanelHeader } from './SessionPanelHeader'
import { SessionPanelDetails } from './SessionPanelDetails'

interface SessionPanelProps {
  session: Session | null
  isOpen: boolean
  onClose: () => void
}

export const SessionPanel = ({ session, isOpen, onClose }: SessionPanelProps) => {
  if (!session) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-zinc-900/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      ></div>

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl border-l border-zinc-200 z-[60] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <SessionPanelHeader session={session} onClose={onClose} />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          <SessionPanelDetails session={session} />
        </div>

        {/* Panel Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 text-center">
          <p className="text-[10px] text-zinc-400">Zuletzt aktualisiert vor 2 Stunden</p>
        </div>
      </div>
    </>
  )
}

