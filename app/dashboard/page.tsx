"use client";

import { redirect } from "next/navigation";
import { currentUser } from "@/data/mockData";

export default function DashboardPage() {
  if (currentUser.role !== "professor" && currentUser.name !== "Markus") {
    redirect("/schedule");
  }

  redirect("/dashboard/lvs");
}
