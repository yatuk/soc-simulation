import { useSettingsStore } from '@/store'
import { Moon, Sun, Monitor, Coffee } from 'lucide-react'

export default function Settings() {
  const { settings, updateSetting } = useSettingsStore()

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <h2 className="text-sm font-semibold">Ayarlar</h2>

      {/* Theme */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tema</h3>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: 'dark', icon: Moon, label: 'Karanlık' },
            { key: 'light', icon: Sun, label: 'Aydınlık' },
            { key: 'system', icon: Monitor, label: 'Sistem' },
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

      {/* Table Density */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tablo Yoğunluğu</h3>
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
              {d === 'compact' ? 'Sıkışık' : d === 'normal' ? 'Normal' : 'Rahat'}
            </button>
          ))}
        </div>
      </section>

      {/* MTTC Easter Egg */}
      <section className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Coffee className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-semibold">MTTC: Mean Time To Coffee</h3>
        </div>
        <div className="text-2xl font-bold">12 dk</div>
        <p className="text-[10px] text-muted-foreground mt-1">Bugünkü kahve: 6 fincan</p>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: '72%' }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Günlük kahve kotası: %72</p>
      </section>
    </div>
  )
}
