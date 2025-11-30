import type { Course } from "@/data/mockData";
import { CourseFilterButton } from "@/components/groups/CourseFilterButton";
import { Select } from "@/components/ui/Select";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

type CourseFilterButtonsProps = {
  courses: Course[];
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string | null) => void;
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
      value: "",
      label: loading ? "Alle Fächer" : `Alle Fächer (${totalGroupCount})`,
    },
    ...courses.map((course) => {
      const courseCount = courseGroupCounts[course.id] ?? 0;
      return {
        value: course.id,
        label: loading ? course.title : `${course.title} (${courseCount})`,
      };
    }),
  ];

  const handleSelectChange = (value: string) => {
    onSelectCourse(value === "" ? null : value);
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
          value={selectedCourseId || ""}
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
