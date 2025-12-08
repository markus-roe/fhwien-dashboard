import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "@/shared/lib/api";
import type { Course, Program } from "@/shared/data/mockData";

export function useCourses(program?: Program) {
  const {
    data: courses = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<Course[]>({
    queryKey: ["courses", program],
    queryFn: () => coursesApi.getAll(program ? { program } : undefined),
  });

  return {
    courses,
    loading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    refetch,
  };
}
