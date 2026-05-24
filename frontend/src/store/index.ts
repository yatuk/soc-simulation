import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loadEntity } from '@/lib/data'
import type {
  Alert, Incident, IOC, Asset, User,
  PlaybookDefinition, PlaybookRun, DetectionRule,
  MitreCoverage, KPIMetrics, Settings,
} from '@/types'

// ── Generic entity store factory ───────────────────────────
interface EntityState<T> {
  data: T[]
  isLoading: boolean
  error: string | null
  load: () => Promise<void>
}

function createEntityStore<T>(filename: string) {
  return create<EntityState<T>>((set) => ({
    data: [],
    isLoading: false,
    error: null,
    load: async () => {
      set({ isLoading: true, error: null })
      try {
        const data = await loadEntity<T[]>(filename)
        set({ data, isLoading: false })
      } catch (err) {
        set({ error: (err as Error).message, isLoading: false })
      }
    },
  }))
}

// ── Entity stores ──────────────────────────────────────────
export const useAlertStore = createEntityStore<Alert>('alerts.json')
export const useIncidentStore = createEntityStore<Incident>('incidents.json')
export const useIOCStore = createEntityStore<IOC>('iocs.json')
export const useAssetStore = createEntityStore<Asset>('assets.json')
export const useUserStore = createEntityStore<User>('users.json')
export const usePlaybookDefStore = createEntityStore<PlaybookDefinition>('playbook_definitions.json')
export const usePlaybookRunStore = createEntityStore<PlaybookRun>('playbook_runs.json')
export const useDetectionStore = createEntityStore<DetectionRule>('detection_rules.json')

// ── MITRE store (single object) ────────────────────────────
interface MitreState {
  data: MitreCoverage | null
  isLoading: boolean
  error: string | null
  load: () => Promise<void>
}

export const useMitreStore = create<MitreState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  load: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await loadEntity<MitreCoverage>('mitre_coverage.json')
      set({ data, isLoading: false })
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
    }
  },
}))

// ── KPI store (single object) ──────────────────────────────
interface KPIState {
  data: KPIMetrics | null
  isLoading: boolean
  error: string | null
  load: () => Promise<void>
}

export const useKPIStore = create<KPIState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  load: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await loadEntity<KPIMetrics>('kpi_metrics.json')
      set({ data, isLoading: false })
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
    }
  },
}))

// ── UI Store ───────────────────────────────────────────────
interface UIState {
  sidebarCollapsed: boolean
  cmdPaletteOpen: boolean
  activeDrawer: string | null
  drawerData: unknown
  toggleSidebar: () => void
  toggleCmdPalette: () => void
  openDrawer: (type: string, data?: unknown) => void
  closeDrawer: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  cmdPaletteOpen: false,
  activeDrawer: null,
  drawerData: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleCmdPalette: () => set((s) => ({ cmdPaletteOpen: !s.cmdPaletteOpen })),
  openDrawer: (type, data) => set({ activeDrawer: type, drawerData: data ?? null }),
  closeDrawer: () => set({ activeDrawer: null, drawerData: null }),
}))

// ── Settings Store (persisted) ─────────────────────────────
const defaultSettings: Settings = {
  theme: 'dark',
  sidebarExpanded: true,
  tableDensity: 'normal',
}

interface SettingsState {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSetting: (key, value) => set((s) => ({
        settings: { ...s.settings, [key]: value },
      })),
    }),
    { name: 'soc-settings' }
  )
)
