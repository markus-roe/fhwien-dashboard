"use client";

import { useState } from "react";
import { Bug, Lightbulb, CheckCircle2, Clock, XCircle, Filter, Trash2 } from "lucide-react";
import type { Report, ReportStatus, ReportType } from "@/shared/lib/api-types";
import { Button } from "@/shared/components/ui/Button";
import { Select } from "@/shared/components/ui/Select";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type ReportsTabProps = {
  reports: Report[];
  onStatusChange: (reportId: number, status: ReportStatus) => void;
  onDelete?: (reportId: number) => void;
  loading?: boolean;
};

const statusOptions = [
  { value: "", label: "Alle Status" },
  { value: "open", label: "Offen" },
  { value: "in_progress", label: "In Bearbeitung" },
  { value: "resolved", label: "Gelöst" },
  { value: "closed", label: "Geschlossen" },
];

const typeOptions = [
  { value: "", label: "Alle Typen" },
  { value: "feature_request", label: "Feature Request" },
  { value: "bug_report", label: "Bug Report" },
];

const statusLabels: Record<ReportStatus, string> = {
  open: "Offen",
  in_progress: "In Bearbeitung",
  resolved: "Gelöst",
  closed: "Geschlossen",
};

const statusColors: Record<ReportStatus, string> = {
  open: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  closed: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export function ReportsTab({
  reports,
  onStatusChange,
  onDelete,
  loading = false,
}: ReportsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const filteredReports = (reports || []).filter((report) => {
    if (statusFilter && report.status !== statusFilter) return false;
    if (typeFilter && report.type !== typeFilter) return false;
    return true;
  });

  const openCount = (reports || []).filter((r) => r.status === "open").length;
  const inProgressCount = (reports || []).filter((r) => r.status === "in_progress").length;

  if (loading) {
    return (
      <div className="p-4 text-center text-zinc-500">Laden...</div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Status filtern"
          />
        </div>
        <div className="flex-1">
          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="Typ filtern"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            {(reports || []).length === 0
              ? "Keine Reports vorhanden"
              : "Keine Reports entsprechen den Filtern"}
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-colors bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    {report.type === "feature_request" ? (
                      <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Bug className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-zinc-900 mb-1 break-words">
                        {report.title}
                      </h3>
                      <p className="text-sm text-zinc-600 mb-3 line-clamp-2 break-words">
                        {report.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span>
                          {report.user.name} ({report.user.email})
                        </span>
                        <span>•</span>
                        <span>
                          {format(new Date(report.createdAt), "d. MMM yyyy, HH:mm", {
                            locale: de,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 sm:flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[report.status]}`}
                  >
                    {statusLabels[report.status]}
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {report.status !== "closed" && (
                      <Select
                        options={[
                          { value: "open", label: "Offen" },
                          { value: "in_progress", label: "In Bearbeitung" },
                          { value: "resolved", label: "Gelöst" },
                          { value: "closed", label: "Geschlossen" },
                        ]}
                        value={report.status}
                        onChange={(value) =>
                          onStatusChange(report.id, value as ReportStatus)
                        }
                        triggerClassName="w-full sm:w-auto min-w-[160px]"
                      />
                    )}
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        icon={Trash2}
                        onClick={() => onDelete(report.id)}
                        className="w-full sm:w-auto"
                      >
                        Löschen
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
