import { ReactNode } from "react";
import { PastItemsToggle } from "./PastItemsToggle";
import { LoadingSkeletonDataTable } from "@/shared/components/ui/LoadingSkeleton";

type DataTableProps<T> = {
  items: T[];
  emptyMessage: string;
  headerColumns: string[];
  gridCols: string;
  renderRow: (item: T, index: number) => ReactNode;
  renderCard: (item: T, index: number) => ReactNode;
  pastItemsCount?: number;
  showPastItems?: boolean;
  onTogglePastItems?: () => void;
  pastItemsLabel?: string;
  loading?: boolean;
};

export function DataTable<T>({
  items,
  emptyMessage,
  headerColumns,
  gridCols,
  renderRow,
  renderCard,
  pastItemsCount = 0,
  showPastItems = false,
  onTogglePastItems,
  pastItemsLabel,
  loading = false,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <LoadingSkeletonDataTable
        headerColumns={headerColumns}
        gridCols={gridCols}
        pastItemsLabel={pastItemsLabel}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-zinc-200 rounded-lg p-4 text-center text-xs text-zinc-500 bg-zinc-50/60">
        {emptyMessage}
      </div>
    );
  }

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

        {/* Table Body */}
        <div className="divide-y divide-zinc-100">
          {pastItemsCount > 0 && onTogglePastItems && pastItemsLabel && (
            <PastItemsToggle
              count={pastItemsCount}
              isOpen={showPastItems}
              onToggle={onTogglePastItems}
              label={pastItemsLabel}
            />
          )}

          {items.map((item, index) => renderRow(item, index))}
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-2">
        {pastItemsCount > 0 && onTogglePastItems && pastItemsLabel && (
          <PastItemsToggle
            count={pastItemsCount}
            isOpen={showPastItems}
            onToggle={onTogglePastItems}
            label={pastItemsLabel}
            className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md hover:bg-zinc-100"
          />
        )}

        {items.map((item, index) => renderCard(item, index))}
      </div>
    </>
  );
}
