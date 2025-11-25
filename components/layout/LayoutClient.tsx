"use client";

import { ReactNode } from 'react'
import { TopNav } from './TopNav'

interface ClientLayoutProps {
  children: ReactNode
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  return (
    <div className="h-screen flex flex-col overflow-y-auto">
      <TopNav />
      <main className="flex-1 w-full px-2 sm:px-2 pt-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

