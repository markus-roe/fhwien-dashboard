import { ReactNode } from 'react'
import { TopNav } from './TopNav'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <TopNav />
      <main className="flex-1 max-w-7xl mx-auto px-6 w-full pt-8 pb-20">
        {children}
      </main>
    </>
  )
}

