import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Report,
  ReportsResponse,
  CreateReportRequest,
  UpdateReportRequest,
} from "@/shared/lib/api-types";

export function useReports(status?: string, type?: string) {
  const queryParams = new URLSearchParams();
  if (status) queryParams.append("status", status);
  if (type) queryParams.append("type", type);

  const queryString = queryParams.toString();
  const url = `/api/reports${queryString ? `?${queryString}` : ""}`;

  return useQuery<ReportsResponse>({
    queryKey: ["reports", status, type],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || "Failed to fetch reports");
      }
      const data = await response.json();
      return data;
    },
    retry: 1,
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      data,
    }: {
      reportId: number;
      data: UpdateReportRequest;
    }) => {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: number) => {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete report");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
