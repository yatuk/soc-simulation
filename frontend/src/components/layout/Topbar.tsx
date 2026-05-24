import { useUIStore, useSettingsStore } from '@/store'
import { Menu, Moon, Sun, Search } from 'lucide-react'
import { NotificationsBell } from '@/components/layout/NotificationsBell'

const pageTitles: Record<string, string> = {
  '/': 'Genel Bakış',
  '/alerts': 'Uyarılar',
  '/incidents': 'Olaylar',
  '/iocs': 'IOC Explorer',
  '/playbooks': 'SOAR Playbookları',
  '/endpoints': 'Cihazlar (EDR)',
  '/mitre': 'MITRE ATT&CK',
  '/detections': 'Sigma Kuralları',
  '/settings': 'Ayarlar',
}

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const toggleCmdPalette = useUIStore((s) => s.toggleCmdPalette)
  const { settings, updateSetting } = useSettingsStore()
  const path = window.location.hash.replace('#', '') || '/'
  const title = pageTitles[path] || 'SOC Console'

  return (
    <header className="sticky top-0 z-30 flex items-center h-14 px-4 bg-card/80 backdrop-blur border-b border-border">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1 rounded hover:bg-accent"
          aria-label="Menü"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleCmdPalette}
          className="flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-muted/50 text-muted-foreground text-xs hover:bg-muted transition-colors"
          aria-label="Komut paletini aç (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ara...</span>
          <kbd className="hidden md:inline text-[10px] px-1 rounded bg-background border border-border ml-4">
            Ctrl+K
          </kbd>
        </button>

        <NotificationsBell />

        <button
          onClick={() =>
            updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')
          }
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
          aria-label={settings.theme === 'dark' ? 'Aydınlık mod' : 'Karanlık mod'}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <div
          className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary"
          aria-label="Kullanıcı: Emre Korkmaz"
          role="img"
        >
          EK
        </div>
      </div>
    </header>
  )
}
