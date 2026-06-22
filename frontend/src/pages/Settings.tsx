import { useSettingsStore } from '@/store'
import { useTranslation } from '@/i18n'
import { Moon, Sun, Monitor, Coffee, Languages } from 'lucide-react'

export default function Settings() {
  const { settings, updateSetting } = useSettingsStore()
  const { t } = useTranslation()

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <h2 className="text-sm font-semibold">{t('settings.title')}</h2>

      {/* Language */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.language')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'tr', icon: Languages, label: t('settings.languageTR') },
            { key: 'en', icon: Languages, label: t('settings.languageEN') },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => updateSetting('language', key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs transition-colors ${
                settings.language === key
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
              aria-pressed={settings.language === key}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.theme')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: 'dark', icon: Moon, label: t('settings.themeDark') },
            { key: 'light', icon: Sun, label: t('settings.themeLight') },
            { key: 'system', icon: Monitor, label: t('settings.themeSystem') },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => updateSetting('theme', key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs transition-colors ${
                settings.theme === key
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
              aria-pressed={settings.theme === key}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Sidebar */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.sidebar')}</h3>
        <button
          onClick={() => updateSetting('sidebarExpanded', !settings.sidebarExpanded)}
          className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-colors ${
            settings.sidebarExpanded
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'border-border text-muted-foreground hover:bg-accent'
          }`}
          aria-pressed={settings.sidebarExpanded}
        >
          {t('settings.sidebarExpanded')}
        </button>
      </section>

      {/* Table Density */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('settings.tableDensity')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['compact', 'normal', 'comfortable'] as const).map((d) => (
            <button
              key={d}
              onClick={() => updateSetting('tableDensity', d)}
              className={`px-3 py-2 rounded-lg border text-xs transition-colors capitalize ${
                settings.tableDensity === d
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-muted-foreground hover:bg-accent'
              }`}
              aria-pressed={settings.tableDensity === d}
            >
              {d === 'compact' ? t('settings.densityCompact') : d === 'normal' ? t('settings.densityNormal') : t('settings.densityComfortable')}
            </button>
          ))}
        </div>
      </section>

      {/* MTTC Easter Egg */}
      <section className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Coffee className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-semibold">{t('settings.mttcSection')}</h3>
        </div>
        <div className="text-2xl font-bold">12 dk</div>
        <p className="text-xs text-muted-foreground mt-1">{t('settings.coffeeCount')}: 6</p>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: '72%' }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{t('settings.coffeeLimit')}: %72</p>
      </section>
    </div>
  )
}
