import type { Course } from "@/data/mockData";
import { CourseFilterButton } from "@/components/groups/CourseFilterButton";

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
  return (
    <div className="flex flex-col gap-2">
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
  );
}

