import { Badge } from "@/shared/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/Card";
import type { Course } from "@/shared/data/mockData";

type CourseSelectorMobileProps = {
  courses: Course[];
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string | null) => void;
  courseGroupCounts: Map<string, number>;
};

export function CourseSelectorMobile({
  courses,
  selectedCourseId,
  onSelectCourse,
  courseGroupCounts,
}: CourseSelectorMobileProps) {
  return (
    <div className="lg:hidden">
      <Card>
        <CardHeader>
          <h2 className="text-xs sm:text-sm font-medium text-zinc-900">Fächer</h2>
        </CardHeader>
        <CardContent className="px-4 sm:p-6 pb-4 sm:pb-6">
          <div className="space-y-2">
            <button
              onClick={() => onSelectCourse(null)}
              className={`w-full text-left p-3 rounded-lg transition-all border ${
                !selectedCourseId
                  ? "bg-[var(--primary)] text-white border-transparent"
                  : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white"
              }`}
            >
              <div className="text-sm font-semibold">Alle Fächer</div>
            </button>
            {courses.map((course) => {
              const groupCount = courseGroupCounts.get(course.id) || 0;
              const isSelected = selectedCourseId === course.id;

              return (
                <button
                  key={course.id}
                  onClick={() => onSelectCourse(course.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected
                      ? "bg-[var(--primary)] text-white border-transparent"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-semibold ${
                          isSelected ? "text-white" : "text-zinc-900"
                        }`}
                      >
                        {course.title}
                      </div>
                    </div>
                    {groupCount > 0 && (
                      <Badge variant="default" className="ml-2 shrink-0">
                        {groupCount}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

