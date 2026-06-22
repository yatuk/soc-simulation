import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale/tr'
import { enUS } from 'date-fns/locale/en-US'

const locales = { tr, en: enUS }

export function relativeTime(date: string | Date, language: 'tr' | 'en' = 'tr'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return formatDistanceToNow(d, { addSuffix: true, locale: locales[language] })
}

export function formatTimestamp(date: string | Date, language: 'tr' | 'en' = 'tr'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
