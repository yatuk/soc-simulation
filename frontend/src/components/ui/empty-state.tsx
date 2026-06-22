import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 min-h-[40vh] text-center', className)}>
      {icon && <div className="mb-3 text-muted-foreground/50">{icon}</div>}
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground/70 max-w-sm">{description}</p>
      )}
    </div>
  )
}
