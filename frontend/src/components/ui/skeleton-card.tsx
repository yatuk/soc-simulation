import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-card p-4 overflow-hidden', className)}
      role="status"
      aria-label="Yükleniyor"
    >
      <div className="h-3 w-24 rounded mb-3 skeleton-shimmer" />
      <div className="h-6 w-16 rounded mb-2 skeleton-shimmer" />
      <div className="h-3 w-32 rounded skeleton-shimmer" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div
      className={cn('rounded-lg border border-border overflow-hidden', className)}
      role="status"
      aria-label="Yükleniyor"
    >
      <div className="h-8 bg-muted/50 border-b border-border" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 border-b border-border last:border-0 px-4 flex items-center gap-2">
          <div className="h-3 rounded w-1/4 skeleton-shimmer" />
          <div className="h-3 rounded w-1/6 skeleton-shimmer" />
          <div className="h-3 rounded w-1/5 ml-auto skeleton-shimmer" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart({ height = 'h-64', className }: { height?: string; className?: string }) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-card p-4', height, className)}
      role="status"
      aria-label="Yükleniyor"
    >
      <div className="h-3 w-24 rounded mb-4 skeleton-shimmer" />
      <div className={cn('rounded skeleton-shimmer w-full', height === 'h-80' ? 'h-56' : 'h-44')} />
    </div>
  )
}
