import type { Course } from "@/shared/lib/api-types";
import { CourseFilterButton } from "@/features/groups/components/CourseFilterButton";
import { Select } from "@/shared/components/ui/Select";
import { LoadingSkeleton } from "@/shared/components/ui/LoadingSkeleton";

type CourseFilterButtonsProps = {
  courses: Course[];
  selectedCourseId: number | null;
  onSelectCourse: (courseId: number | null) => void;
  totalGroupCount: number;
  courseGroupCounts: Record<string, number>;
  loading?: boolean;
};

export function CourseFilterButtons({
  courses,
  selectedCourseId,
  onSelectCourse,
  totalGroupCount,
  courseGroupCounts,
  loading = false,
}: CourseFilterButtonsProps) {
  // Prepare options for Select
  const selectOptions = [
    {
      value: "0",
      label: loading ? "Alle Fächer" : `Alle Fächer (${totalGroupCount})`,
    },
    ...courses.map((course) => {
      const courseCount = courseGroupCounts[course.id] ?? 0;
      return {
        value: course.id.toString(),
        label: loading ? course.title : `${course.title} (${courseCount})`,
      };
    }),
  ];

  const handleSelectChange = (value: string) => {
    onSelectCourse(value === "0" ? null : parseInt(value));
  };

  if (loading) {
    return (
      <>
        {/* Mobile: Select */}
        <div className="lg:hidden">
          <LoadingSkeleton height={40} className="rounded-md" />
        </div>

        {/* Desktop: Buttons */}
        <div className="hidden lg:flex flex-col gap-2">
          {[...Array(7)].map((_, i) => (
            <LoadingSkeleton key={i} height={36} className="rounded-md" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile: Select */}
      <div className="lg:hidden">
        <Select
          options={selectOptions}
          value={selectedCourseId?.toString() || "0"}
          onChange={handleSelectChange}
          placeholder="Fach auswählen"
        />
      </div>

      {/* Desktop: Buttons */}
      <div className="hidden lg:flex flex-col gap-2">
        <CourseFilterButton
          label="Alle Fächer"
          count={totalGroupCount}
          isActive={!selectedCourseId}
          onClick={() => onSelectCourse(null)}
        />
        {courses.map((course) => {
          const isActive = selectedCourseId === course.id;
          const courseCount = courseGroupCounts[course.id] ?? 0;
          return (
            <CourseFilterButton
              key={course.id}
              label={course.title}
              count={courseCount}
              isActive={isActive}
              onClick={() => onSelectCourse(course.id)}
            />
          );
        })}
      </div>
    </>
  );
}
