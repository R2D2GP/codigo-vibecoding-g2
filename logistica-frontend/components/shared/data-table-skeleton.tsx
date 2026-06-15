import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  rows?: number
  columns?: number
}

export function DataTableSkeleton({ rows = 5, columns = 4 }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 pb-4">
        <Skeleton className="h-4 w-4 shrink-0" />
        <Skeleton className="h-9 w-60" />
      </div>
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-muted/30">
          <div className="flex gap-4 px-4 py-3">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={`h-${i}`} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`r-${r}`} className={r < rows - 1 ? "border-b" : ""}>
            <div className="flex gap-4 px-4 py-4">
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton key={`c-${r}-${c}`} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 py-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  )
}
