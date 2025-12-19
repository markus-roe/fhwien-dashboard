'use client'

import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

interface FilterBarProps {
  selectedProgram: 'DTI' | 'DI'
  onProgramChange: (program: 'DTI' | 'DI') => void
}

export const FilterBar = ({ selectedProgram, onProgramChange }: FilterBarProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-100 p-1 rounded-md flex">
        <button
          onClick={() => onProgramChange('DTI')}
          className={`flex-1 text-xs font-medium py-1.5 px-3 rounded shadow-sm transition-all ${
            selectedProgram === 'DTI'
              ? 'bg-white text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          DTI
        </button>
        <button
          onClick={() => onProgramChange('DI')}
          className={`flex-1 text-xs font-medium py-1.5 px-3 rounded shadow-sm transition-all ${
            selectedProgram === 'DI'
              ? 'bg-white text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          DI
        </button>
      </div>

      <div className="space-y-1">
        <div className="relative group">
          <button className="w-full flex items-center justify-between bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-900 text-xs font-medium px-3 py-2 rounded-md transition-colors text-left shadow-sm">
            <span className="truncate">Alle Module</span>
            <ChevronsUpDown className="w-3 h-3 text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

