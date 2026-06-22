import { Link } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
      <FileQuestion className="w-12 h-12 text-muted-foreground" />
      <h1 className="text-lg font-semibold">404</h1>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {t('notFound.description')}
      </p>
      <Link
        to="/"
        className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm hover:bg-primary/20 transition-colors"
      >
        {t('notFound.cta')}
      </Link>
    </div>
  )
}
