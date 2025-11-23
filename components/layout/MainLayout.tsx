import { ReactNode } from 'react'
import { TopNav } from './TopNav'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="h-full flex flex-col">
      <TopNav />
      <main className="flex-1 w-full px-2 sm:px-2 pt-4 pb-4 overflow-hidden flex flex-col min-h-0">
        {children}
      </main>
    </div>
  )
}

