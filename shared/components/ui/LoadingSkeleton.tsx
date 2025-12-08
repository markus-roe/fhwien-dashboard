export function LoadingSkeleton({
  className = "",
  width,
  height,
  color = "bg-zinc-200",
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  color?: string;
}) {
  return (
    <div
      className={`animate-pulse ${color} rounded ${className}`}
      style={{
        width: width || "100%",
        height: height || "1rem",
      }}
    />
  );
}

export function LoadingSkeletonCard() {
  return (
    <div className="border border-zinc-200 rounded-lg p-4 bg-white">
      <div className="space-y-3">
        <LoadingSkeleton height="1rem" width="60%" />
        <LoadingSkeleton height="0.875rem" width="80%" />
        <LoadingSkeleton height="0.875rem" width="40%" />
      </div>
    </div>
  );
}

export function LoadingSkeletonRow({
  gridCols,
  columnCount,
}: {
  gridCols?: string;
  columnCount?: number;
}) {
  const cols = gridCols || "grid-cols-[140px,100px,180px,1fr,180px,auto]";
  const count = columnCount || 6;

  return (
    <div
      className={`grid ${cols} items-center gap-3 px-4 py-3 border-b border-zinc-100`}
    >
      {[...Array(count)].map((_, i) => (
        <LoadingSkeleton
          key={i}
          height="0.875rem"
          width={i === count - 1 ? "60px" : undefined}
          className={i === count - 1 ? "ml-auto" : ""}
        />
      ))}
    </div>
  );
}

export function LoadingState({ message = "Lädt..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
      </div>
      <p className="text-sm text-zinc-600">{message}</p>
    </div>
  );
}

export function LoadingSkeletonCoachingCards() {
  return (
    <>
      <div className="space-y-3">
        <div className="mb-2.5">
          <LoadingSkeleton height={14} width={150} />
        </div>
        <div className="mb-2">
          <LoadingSkeleton height={12} width={100} />
        </div>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          <LoadingSkeletonCoachingCard />
        </div>
      </div>
      <div className="space-y-3">
        <div className="mb-2.5">
          <LoadingSkeleton height={14} width={150} />
        </div>
        <div className="mb-2">
          <LoadingSkeleton height={12} width={100} />
        </div>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          <LoadingSkeletonCoachingCard />
        </div>
      </div>
    </>
  );
}

export function LoadingSkeletonCoachingCard() {
  return (
    <div className="border border-zinc-200 rounded-lg p-3.5 bg-white">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            <LoadingSkeleton height="0.875rem" width="70%" />
            <LoadingSkeleton height="0.75rem" width="50%" />
            <LoadingSkeleton height="0.75rem" width="40%" />
          </div>
          <LoadingSkeleton
            width={60}
            height={24}
            className="rounded shrink-0"
          />
        </div>
        <div className="pt-2 border-t border-zinc-100 space-y-2">
          <LoadingSkeleton height="0.75rem" width="90%" />
          <LoadingSkeleton height="0.75rem" width="60%" />
          <div className="flex flex-wrap gap-1 pt-1.5">
            <LoadingSkeleton width={50} height={20} className="rounded-full" />
            <LoadingSkeleton width={60} height={20} className="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeletonGroupCards() {
  return (
    <>
      <div className="mb-2.5">
        <LoadingSkeleton height="0.75rem" width="30%" />
      </div>
      <div className="space-y-2.5">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeletonGroupCard key={i} />
        ))}
      </div>
    </>
  );
}

export function LoadingSkeletonGroupCard({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}) {
  return (
    <div className="border border-zinc-200 rounded-lg p-3 sm:p-4 bg-white max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 relative pr-8">
            <LoadingSkeleton height="0.875rem" width="60%" className="mb-0.5" />
            <LoadingSkeleton height="0.75rem" width="40%" />
            {isAdmin && (
              <LoadingSkeleton
                width={28}
                height={28}
                className="absolute top-0 right-0 rounded"
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <LoadingSkeleton width={50} height={16} />
            <LoadingSkeleton width={80} height={16} />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <LoadingSkeleton width={50} height={20} className="rounded-full" />
            <LoadingSkeleton width={60} height={20} className="rounded-full" />
            {isAdmin && (
              <LoadingSkeleton width={110} height={24} className="rounded" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeletonSmallCalendar({
  showCourseFilterButtons = false,
}: {
  showCourseFilterButtons?: boolean;
}) {
  return (
    <div className="border border-zinc-200 rounded-lg bg-white relative overflow-hidden select-none pt-5">
      <div className="absolute top-0 left-0 w-full h-1 bg-zinc-200" />
      <div className="p-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <LoadingSkeleton width={24} height={24} className="rounded" />
          <LoadingSkeleton width={120} height={20} />
          <LoadingSkeleton width={24} height={24} className="rounded" />
        </div>
        {/* Days of the week */}
        <div className="grid grid-cols-7 gap-1 mb-1 mt-5">
          {[...Array(7)].map((_, i) => (
            <LoadingSkeleton key={i} height={20} className="rounded" />
          ))}
        </div>
        {/* Days of the month */}
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <LoadingSkeleton key={i} height={35} className="rounded" />
          ))}
        </div>
        {/* Course filter buttons */}
        {showCourseFilterButtons && (
          <div className="mt-5 space-y-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <LoadingSkeleton width={16} height={16} className="rounded" />
                <LoadingSkeleton width="60%" height={14} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadingSkeletonNextUpList() {
  return (
    <div className="p-0">
      <div className="space-y-3">
        {[...Array(3)].map((_, dayIndex) => (
          <div key={dayIndex} className="relative">
            <div className="mb-2 sm:mb-3">
              <LoadingSkeleton height={14} width={100} />
            </div>
            <div className="space-y-2 sm:space-y-3 relative">
              <div className="absolute left-[2.8rem] top-2 bottom-2 w-px bg-zinc-100"></div>
              {[...Array(1)].map((_, sessionIndex) => (
                <div
                  key={sessionIndex}
                  className="group p-2 rounded-md flex gap-3 items-start relative z-10"
                >
                  <div className="w-8 pt-1">
                    <LoadingSkeleton height={20} width={28} />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm mt-1 shrink-0 bg-zinc-200"></div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <LoadingSkeleton height={14} width="80%" />
                    <LoadingSkeleton height={12} width="60%" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingSkeletonCalendarView() {
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="border border-zinc-200 rounded-lg bg-white flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        <div className="p-3 sm:p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="mb-4 shrink-0">
            <LoadingSkeleton height={28} width={150} className="mb-4" />
            <div className="flex items-center justify-between gap-2">
              <LoadingSkeleton height={36} width={200} className="rounded-md" />
              <div className="flex gap-2">
                <LoadingSkeleton
                  height={36}
                  width={36}
                  className="rounded-md"
                />
                <LoadingSkeleton
                  height={36}
                  width={36}
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <div className="grid grid-cols-7 gap-1 h-full">
              {[...Array(42)].map((_, i) => (
                <LoadingSkeleton key={i} height="100%" className="rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeletonPastItemsToggle() {
  return (
    <div className="w-full px-4 py-2.5 flex items-center justify-center gap-2">
      <LoadingSkeleton width={16} height={16} className="rounded" />
      <LoadingSkeleton width={120} height={16} />
      <LoadingSkeleton width={16} height={16} className="rounded" />
    </div>
  );
}

export function LoadingSkeletonDataTable({
  headerColumns,
  gridCols,
  pastItemsLabel,
}: {
  headerColumns: string[];
  gridCols: string;
  pastItemsLabel?: string;
}) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border border-zinc-200 bg-white overflow-hidden">
        {/* Table Header */}
        <div
          className={`grid items-center gap-3 px-4 py-2.5 text-xs font-semibold text-zinc-600 bg-zinc-50 border-b border-zinc-200 ${gridCols}`}
        >
          {headerColumns.map((column, index) => (
            <div
              key={`header-${index}`}
              className={
                index === headerColumns.length - 1 && !column
                  ? "flex justify-end"
                  : ""
              }
            >
              {column}
            </div>
          ))}
        </div>
        {/* Loading Skeleton Rows */}
        <div className="divide-y divide-zinc-100">
          {pastItemsLabel && <LoadingSkeletonPastItemsToggle />}
          {[...Array(5)].map((_, i) => (
            <LoadingSkeletonRow
              key={i}
              gridCols={gridCols}
              columnCount={headerColumns.length}
            />
          ))}
        </div>
      </div>
      {/* Mobile List View */}
      <div className="md:hidden space-y-2">
        {pastItemsLabel && (
          <div className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md">
            <LoadingSkeletonPastItemsToggle />
          </div>
        )}
        {[...Array(3)].map((_, i) => (
          <LoadingSkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}
