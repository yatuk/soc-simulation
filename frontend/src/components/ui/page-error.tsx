import { useTranslation } from '@/i18n'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface PageErrorProps {
  title?: string
}

export function PageError({ title }: PageErrorProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-6">
      <AlertTriangle className="w-10 h-10 text-muted-foreground" />
      <div className="text-center">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {title || t('errorBoundary.title')}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t('errorBoundary.description')}
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs hover:bg-accent transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        {t('errorBoundary.cta')}
      </button>
    </div>
  )
}
