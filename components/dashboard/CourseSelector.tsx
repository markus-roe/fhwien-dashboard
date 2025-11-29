import { Select } from "@/components/ui/Select";
import type { Course } from "@/data/mockData";

type CourseSelectorProps = {
  courses: Course[];
  selectedCourseId: string | null;
  onCourseChange: (courseId: string | null) => void;
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
        options={options}
        value={selectedCourseId || ""}
        onChange={(value) => onCourseChange(value || null)}
      />
    </div>
  );
}
