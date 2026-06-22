import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const PAGE_SIZES = [25, 50, 100]

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  if (total <= PAGE_SIZES[0]) return null

  return (
    <div className="flex items-center justify-between pt-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{start}–{end} / {total}</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="h-6 px-1 rounded border border-border bg-card text-xs focus:outline-none"
        >
          {PAGE_SIZES.map(s => <option key={s} value={s}>{s}/sayfa</option>)}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let pageNum: number
          if (totalPages <= 7) {
            pageNum = i + 1
          } else if (page <= 4) {
            pageNum = i + 1
          } else if (page >= totalPages - 3) {
            pageNum = totalPages - 6 + i
          } else {
            pageNum = page - 3 + i
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'w-6 h-6 rounded text-xs transition-colors',
                page === pageNum ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent'
              )}
            >
              {pageNum}
            </button>
          )
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
