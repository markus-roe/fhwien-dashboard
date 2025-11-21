import { ReactNode } from 'react'

interface TabsProps {
  children: ReactNode
  className?: string
}

interface TabProps {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}

export const Tabs = ({ children, className = '' }: TabsProps) => {
  return (
    <div className={`flex items-center gap-1 border-b border-zinc-200 pb-1 w-full ${className}`}>
      {children}
    </div>
  )
}

export const Tab = ({ children, active = false, onClick }: TabProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'text-zinc-900 border-b-2 border-zinc-900 -mb-1.5 z-10'
          : 'text-zinc-500 hover:text-zinc-900'
      }`}
    >
      {children}
    </button>
  )
}

