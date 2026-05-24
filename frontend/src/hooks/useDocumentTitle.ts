import { useEffect } from 'react'

const BASE = 'SOC Console'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : BASE
    return () => {
      document.title = BASE
    }
  }, [title])
}
