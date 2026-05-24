import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface PivotLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  title?: string
}

export function PivotLink({ to, children, className, title }: PivotLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'underline decoration-dotted underline-offset-2 decoration-muted-foreground/40',
        'hover:decoration-primary/60 hover:text-primary transition-colors cursor-pointer',
        className
      )}
      title={title ?? 'Bu entity\'e pivot yap'}
    >
      {children}
    </Link>
  )
}
