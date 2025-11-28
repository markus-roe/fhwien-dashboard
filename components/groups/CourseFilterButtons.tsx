import type { Course } from "@/data/mockData";
import { CourseFilterButton } from "@/components/groups/CourseFilterButton";
import { Select } from "@/components/ui/Select";

type CourseFilterButtonsProps = {
  courses: Course[];
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string | null) => void;
  totalGroupCount: number;
  courseGroupCounts: Record<string, number>;
};

export function CourseFilterButtons({
  courses,
  selectedCourseId,
  onSelectCourse,
  totalGroupCount,
  courseGroupCounts,
}: CourseFilterButtonsProps) {
  // Prepare options for Select
  const selectOptions = [
    {
      value: "",
      label: `Alle Fächer (${totalGroupCount})`,
    },
    ...courses.map((course) => {
      const courseCount = courseGroupCounts[course.id] ?? 0;
      return {
        value: course.id,
        label: `${course.title} (${courseCount})`,
      };
    }),
  ];

  const handleSelectChange = (value: string) => {
    onSelectCourse(value === "" ? null : value);
  };

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
