"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";

export default function DashboardPage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!userLoading) {
      if (!currentUser || currentUser.role !== "professor") {
        router.push("/schedule");
      } else {
        router.push("/dashboard/lvs");
      }
    }
  }, [currentUser, userLoading, router]);

  return <div className="p-4">Laden...</div>;
}
