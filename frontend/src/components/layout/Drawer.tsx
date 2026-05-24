import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

interface DrawerProps {
  title: string
  children: React.ReactNode
  wide?: boolean
}

export function Drawer({ title, children, wide }: DrawerProps) {
  const { activeDrawer, closeDrawer } = useUIStore()
  const isOpen = activeDrawer !== null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    if (isOpen) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeDrawer])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 h-full bg-card border-l border-border shadow-2xl animate-slide-in-right',
          wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={closeDrawer}
            className="p-1 rounded hover:bg-accent transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-3.5rem)] p-4">{children}</div>
      </aside>
    </>
  )
}
