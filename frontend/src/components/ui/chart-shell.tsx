import { cn } from '@/lib/utils'

interface ChartShellProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function ChartShell({ title, children, className }: ChartShellProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-4', className)}>
      <h3 className="text-xs font-semibold mb-3">{title}</h3>
      {children}
    </div>
  )
}
