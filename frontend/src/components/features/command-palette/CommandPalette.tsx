import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { useAlertStore, useIncidentStore, useIOCStore, useAssetStore, useUserStore } from '@/store'
import { useSettingsStore, useUIStore } from '@/store'
import { toast } from 'sonner'
import {
  LayoutDashboard, AlertTriangle, FileSearch, Shield, Play, Monitor, Target, Crosshair,
  Settings, Search,
} from 'lucide-react'

// Fuzzy search with Turkish character normalization
function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
}

interface Props {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { data: alerts, load: loadAlerts } = useAlertStore()
  const { data: incidents, load: loadInc } = useIncidentStore()
  const { data: iocs, load: loadIocs } = useIOCStore()
  const { data: assets, load: loadAssets } = useAssetStore()
  const { data: users, load: loadUsers } = useUserStore()
  const { settings, updateSetting } = useSettingsStore()
  const { toggleSidebar } = useUIStore()
  const [query, setQuery] = useState('')

  // Preload data if stores are empty (e.g. palette opened from Settings page)
  useEffect(() => {
    if (open) {
      if (alerts.length === 0) loadAlerts()
      if (incidents.length === 0) loadInc()
      if (iocs.length === 0) loadIocs()
      if (assets.length === 0) loadAssets()
      if (users.length === 0) loadUsers()
    }
  }, [open])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open ? onClose() : document.dispatchEvent(new CustomEvent('open-cmdk'))
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Esc closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const onSelect = useCallback((fn: () => void) => {
    fn()
    onClose()
  }, [onClose])

  const filter = useCallback((value: string, search: string) => {
    const nv = normalize(value)
    const ns = normalize(search)
    const tokens = ns.split(/\s+/)
    return tokens.every((t) => nv.includes(t)) ? 1 : 0
  }, [])

  const items = useMemo(() => {
    const pages = [
      { id: 'p-overview', name: 'Genel Bakış', desc: 'Dashboard', path: '/', icon: LayoutDashboard },
      { id: 'p-alerts', name: 'Uyarılar', desc: 'Alert listesi', path: '/alerts', icon: AlertTriangle },
      { id: 'p-incidents', name: 'Olaylar', desc: 'Incident listesi', path: '/incidents', icon: FileSearch },
      { id: 'p-iocs', name: 'IOC Explorer', desc: 'Tehdit göstergeleri', path: '/iocs', icon: Shield },
      { id: 'p-playbooks', name: 'Playbooklar', desc: 'SOAR otomasyonları', path: '/playbooks', icon: Play },
      { id: 'p-endpoints', name: 'Cihazlar', desc: 'EDR endpoint listesi', path: '/endpoints', icon: Monitor },
      { id: 'p-mitre', name: 'MITRE ATT&CK', desc: 'Taktik ve teknik matrisi', path: '/mitre', icon: Target },
      { id: 'p-detections', name: 'Kurallar', desc: 'Sigma detection kuralları', path: '/detections', icon: Crosshair },
      { id: 'p-settings', name: 'Ayarlar', desc: 'Tema, yoğunluk, MTTC', path: '/settings', icon: Settings },
    ]
    return { pages, alerts, incidents, iocs, assets, users }
  }, [alerts, incidents, iocs, assets, users])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <Command filter={filter} label="Global Komut Paleti" shouldFilter={!!query}>
          <div className="flex items-center border-b border-border px-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Ara... (alert, incident, IOC, kullanıcı, ayar)"
              autoFocus
              className="flex-1 h-11 bg-transparent text-sm px-3 outline-none placeholder:text-muted-foreground/50"
            />
            <kbd className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono shrink-0">ESC</kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-xs text-muted-foreground">
              Sonuç bulunamadı.
            </Command.Empty>

            {/* Pages */}
            <Command.Group heading="Sayfalar" className="text-xs">
              {items.pages.map((p) => (
                <Command.Item key={p.id} value={`${p.name} ${p.desc}`} onSelect={() => onSelect(() => navigate(p.path))} className="flex items-center gap-3 px-3 py-2 rounded-md text-xs cursor-pointer data-[selected=true]:bg-accent">
                  <p.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.desc}</div></div>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Alerts */}
            <Command.Group heading={`Uyarılar (${items.alerts.length})`} className="text-xs">
              {items.alerts.slice(0, 8).map((a) => (
                <Command.Item key={a.alert_id} value={`${a.alert_id} ${a.title} ${a.severity}`} onSelect={() => onSelect(() => navigate(`/alerts/${a.alert_id}`))} className="flex items-center gap-3 px-3 py-2 rounded-md text-xs cursor-pointer data-[selected=true]:bg-accent">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0"><div className="font-medium truncate">{a.title}</div><div className="text-xs text-muted-foreground">{a.alert_id} · {a.severity}</div></div>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Incidents */}
            <Command.Group heading={`Olaylar (${items.incidents.length})`} className="text-xs">
              {items.incidents.slice(0, 5).map((inc) => (
                <Command.Item key={inc.incident_id} value={`${inc.incident_id} ${inc.title} ${inc.status}`} onSelect={() => onSelect(() => navigate(`/incidents/${inc.incident_id}`))} className="flex items-center gap-3 px-3 py-2 rounded-md text-xs cursor-pointer data-[selected=true]:bg-accent">
                  <FileSearch className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0"><div className="font-medium truncate">{inc.title}</div><div className="text-xs text-muted-foreground">{inc.incident_id} · {inc.severity}</div></div>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Actions */}
            <Command.Group heading="Aksiyonlar" className="text-xs">
              <Command.Item value="Karanlık mod" onSelect={() => onSelect(() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark'))} className="flex items-center gap-3 px-3 py-2 rounded-md text-xs cursor-pointer data-[selected=true]:bg-accent">
                <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{settings.theme === 'dark' ? 'Aydınlık moda geç' : 'Karanlık moda geç'}</span>
              </Command.Item>
              <Command.Item value="Sidebar" onSelect={() => onSelect(() => toggleSidebar())} className="flex items-center gap-3 px-3 py-2 rounded-md text-xs cursor-pointer data-[selected=true]:bg-accent">
                <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Sidebar'ı aç/kapat</span>
              </Command.Item>
              <Command.Item value="MTTC Kahve" onSelect={() => onSelect(() => { navigate('/settings'); toast('☕ Kahve sayacı: 6 fincan. Limit: 12.', { duration: 3000 }) })} className="flex items-center gap-3 px-3 py-2 rounded-md text-xs cursor-pointer data-[selected=true]:bg-accent">
                <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Kahve sayacını göster</span>
              </Command.Item>
              <Command.Item value="Konami" onSelect={() => onSelect(() => toast('⬆⬆⬇⬇⬅➡⬅➡🅱🅰 Başlat! (Easter egg)', { duration: 4000 }))} className="flex items-center gap-3 px-3 py-2 rounded-md text-xs cursor-pointer data-[selected=true]:bg-accent">
                <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Konami Kodu</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
