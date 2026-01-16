"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/shared/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { useReports, useUpdateReportStatus, useDeleteReport } from "@/features/reports/hooks/useReports";
import { ReportsTab } from "@/features/reports/components/ReportsTab";
import { Button } from "@/shared/components/ui/Button";
import { DeleteConfirmationDialog } from "@/shared/components/ui/DeleteConfirmationDialog";
import type { ReportStatus, Report } from "@/shared/lib/api-types";

export default function ReportsPage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const { data: reports, isLoading: reportsLoading, error: reportsError, refetch } = useReports();
  const updateStatusMutation = useUpdateReportStatus();
  const deleteReportMutation = useDeleteReport();
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  useEffect(() => {
    if (
      !userLoading &&
      currentUser &&
      currentUser.id !== 32
    ) {
      router.push("/schedule");
    }
  }, [currentUser, userLoading, router]);

  if (userLoading || !currentUser) {
    return <div className="p-4">Laden...</div>;
  }

  if (currentUser.id !== 32) {
    return null;
  }

  const handleStatusChange = async (reportId: number, status: ReportStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        reportId,
        data: { status },
      });
    } catch (error) {
      console.error("Failed to update report status:", error);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    try {
      await deleteReportMutation.mutateAsync(reportId);
      setReportToDelete(null);
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };


  if (reportsError) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Fehler beim Laden der Reports</p>
          <p className="text-red-600 text-sm mt-1">
            {reportsError instanceof Error ? reportsError.message : "Unbekannter Fehler"}
          </p>
          <Button onClick={() => refetch()} className="mt-3" size="sm">
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReportsTab
        reports={reports || []}
        onStatusChange={handleStatusChange}
        onDelete={(reportId) => {
          const report = reports?.find((r) => r.id === reportId);
          if (report) {
            setReportToDelete(report);
          }
        }}
        loading={reportsLoading}
      />

      <DeleteConfirmationDialog
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirm={() => {
          if (reportToDelete) {
            handleDeleteReport(reportToDelete.id);
          }
        }}
        title="Report löschen?"
        description="Möchtest du diesen Report wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        itemName={reportToDelete?.title}
        itemDetails={
          reportToDelete
            ? `${reportToDelete.type === "feature_request" ? "Feature Request" : "Bug Report"} von ${reportToDelete.user.name}`
            : undefined
        }
      />
    </>
  );
}
