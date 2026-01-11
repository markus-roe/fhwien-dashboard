import { Select, type SelectOption } from "@/shared/components/ui/Select";
import type { Course } from "@/shared/lib/api-types";

type CourseSelectorProps = {
  courses: Course[];
  selectedCourseId: number | null;
  onCourseChange: (courseId: number | null) => void;
  showAllOption?: boolean;
};

export function CourseSelector({
  courses,
  selectedCourseId,
  onCourseChange,
  showAllOption = true,
}: CourseSelectorProps) {
  const options = showAllOption
    ? [
        { value: "", label: "Alle" },
        ...courses.map((course) => ({
          value: course.id,
          label: course.title,
        })),
      ]
    : courses.map((course) => ({
        value: course.id,
        label: course.title,
      }));

  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1">
        Fach auswählen
      </label>
      <Select
        options={options as SelectOption[]}
        // @ts-expect-error - value is a number
        value={selectedCourseId || ""}
        // @ts-expect-error - value is a number
        onChange={(value) => onCourseChange(value || null)}
      />
    </div>
  );
}
