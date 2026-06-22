import { useSettingsStore } from '@/store'

export function useTableDensity() {
  const density = useSettingsStore((s) => s.settings.tableDensity)

  const cellPadding = density === 'compact' ? 'px-2 py-1'
    : density === 'comfortable' ? 'px-4 py-3'
    : 'px-3 py-2'

  const headerPadding = density === 'compact' ? 'px-2 py-1.5'
    : density === 'comfortable' ? 'px-4 py-3'
    : 'px-3 py-2'

  const rowHeight = density === 'compact' ? 'h-8'
    : density === 'comfortable' ? 'h-12'
    : 'h-10'

  return { cellPadding, headerPadding, rowHeight }
}
