import { useMemo } from 'react'
import { useUIStore, useSettingsStore } from '@/store'
import { useTranslation } from '@/i18n'
import { Menu, Moon, Sun, Search } from 'lucide-react'
import { NotificationsBell } from '@/components/layout/NotificationsBell'

export function Topbar() {
  const { t } = useTranslation()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleCmdPalette = useUIStore((s) => s.toggleCmdPalette)
  const { settings, updateSetting } = useSettingsStore()
  const path = window.location.hash.replace('#', '') || '/'

  const pageTitles: Record<string, string> = useMemo(() => ({
    '/': t('topbar.overview'),
    '/alerts': t('topbar.alerts'),
    '/incidents': t('topbar.incidents'),
    '/iocs': t('topbar.iocs'),
    '/playbooks': t('topbar.playbooks'),
    '/endpoints': t('topbar.endpoints'),
    '/mitre': t('topbar.mitre'),
    '/detections': t('topbar.detections'),
    '/settings': t('topbar.settings'),
    '/threat-actors': t('topbar.threatActors'),
    '/users': t('topbar.users'),
    '/logs': t('topbar.logExplorer'),
    '/cases': t('topbar.cases'),
  }), [t])

  const title = pageTitles[path] || t('app.title')

  return (
    <header className="sticky top-0 z-30 flex items-center h-14 px-4 bg-card/80 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1 rounded hover:bg-accent"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleCmdPalette}
          className="flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-muted/50 text-muted-foreground text-xs hover:bg-muted transition-colors"
          aria-label="Open command palette (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('common.search')}</span>
          <kbd className="hidden md:inline text-xs px-1 rounded bg-background border border-border ml-4">
            Ctrl+K
          </kbd>
        </button>

        <NotificationsBell />

        <button
          onClick={() =>
            updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')
          }
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
          aria-label={settings.theme === 'dark' ? t('settings.themeLight') : t('settings.themeDark')}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <div
          className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary"
          aria-label="User: Emre Korkmaz"
          role="img"
        >
          EK
        </div>
      </div>
    </header>
  )
}
