"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { TopNav } from "./TopNav";

interface ClientLayoutProps {
  children: ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {isLoginPage ? (
          children
        ) : (
          <div className="h-screen flex flex-col overflow-y-auto">
            <TopNav />
            <main className="flex-1 w-full px-2 sm:px-2 pt-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
              {children}
            </main>
          </div>
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
};
