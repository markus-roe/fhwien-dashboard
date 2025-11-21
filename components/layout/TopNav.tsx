'use client'

import { Search } from 'lucide-react'
import { Avatar } from '../ui/Avatar'

export const TopNav = () => {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 rounded-md flex items-center justify-center text-white font-medium text-xs shadow-sm">
              S
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-900">DTI / DI</span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <a href="#" className="text-sm font-medium text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-md transition-all">
              Terminplan
            </a>
            <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 px-3 py-1.5 rounded-md transition-all">
              Coaching
            </a>
            <a href="#" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 px-3 py-1.5 rounded-md transition-all">
              Gruppen
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">

          <div className="h-4 w-px bg-zinc-200 hidden sm:block"></div>

          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-zinc-900">Markus R.</p>
              <p className="text-[10px] text-zinc-500">DTI Student</p>
            </div>
            <Avatar initials="MR" />
          </div>
        </div>
      </div>
    </nav>
  )
}

