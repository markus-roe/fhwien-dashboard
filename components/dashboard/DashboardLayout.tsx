"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Sidebar } from "@/components/layout/Sidebar";
import { SegmentedTabs } from "@/components/ui/SegmentedTabs";
import { useRouter } from "next/navigation";

const VALID_TABS = ["lvs", "coachings", "groups", "users"] as const;

type TabValue = (typeof VALID_TABS)[number];

interface DashboardTab {
  value: TabValue;
  label: string;
  badge?: number;
}

interface DashboardLayoutProps {
  activeTab: TabValue;
  tabs: DashboardTab[];
  children: ReactNode;
}

export function DashboardLayout({
  activeTab,
  tabs,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:shrink-0 lg:overflow-y-scroll">
          <Sidebar
            showCalendar={true}
            showNextUpCard={false}
            emptyMessage="Keine anstehenden Termine."
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-3">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
                  Dashboard
                </h1>
              </div>
              <SegmentedTabs
                value={activeTab}
                onChange={(value) => {
                  const newTab = value as TabValue;
                  router.replace(`/dashboard/${newTab}`, { scroll: false });
                }}
                options={tabs}
                className="mb-4"
              />
              <div className="flex-1 min-w-0 space-y-5">{children}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
