# SOC Console — Mimari Dökümanı

> Faz 1 çıktısı. Uygulama başlamadan önce tüm mimari kararları burada.

---

## 1. Klasör Yapısı

```
SOC-case-study-project/
├── .github/workflows/
│   └── deploy.yml                    # Tek deploy workflow (frontend build + GH Pages)
│
├── frontend/                         # TEK UI (React + Vite + TS + Tailwind)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts                # base: '/SOC-case-study-project/'
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── public/
│   │   ├── shield.svg
│   │   └── data/                     # Pipeline çıktısı, build sırasında kopyalanır
│   │       ├── alerts.json
│   │       ├── incidents.json
│   │       ├── iocs.json
│   │       ├── assets.json           # Endpoints + servers
│   │       ├── users.json
│   │       ├── playbook_runs.json
│   │       ├── detection_rules.json
│   │       └── mitre_coverage.json
│   └── src/
│       ├── main.tsx                  # HashRouter + App mount
│       ├── App.tsx                   # Routes + Layout shell
│       ├── index.css                 # Tailwind directives + CSS custom properties
│       ├── styles/
│       │   └── tokens.css            # Design tokens (severity, status, spacing)
│       ├── lib/
│       │   ├── utils.ts              # cn(), formatTime(), helpers
│       │   └── data.ts               # fetch + cache + store hydration
│       ├── store/
│       │   ├── index.ts              # Barrel export
│       │   ├── alertStore.ts
│       │   ├── incidentStore.ts
│       │   ├── iocStore.ts
│       │   ├── assetStore.ts
│       │   ├── userStore.ts
│       │   ├── playbookStore.ts
│       │   ├── detectionStore.ts
│       │   ├── mitreStore.ts
│       │   ├── uiStore.ts            # sidebar, drawer, search, theme
│       │   └── settingsStore.ts      # persisted (localStorage)
│       ├── types/
│       │   └── index.ts              # Canonical entity interfaces
│       ├── hooks/
│       │   ├── useData.ts            # Data loading orchestration
│       │   └── useTheme.ts           # Dark/light mode toggle
│       ├── components/
│       │   ├── ui/                   # Primitives (Card, Badge, Button, Input, ...)
│       │   ├── layout/               # Sidebar, Topbar, Shell, Drawer
│       │   └── features/             # Page-specific components
│       │       ├── dashboard/        # KPI cards, charts, feeds
│       │       ├── alerts/           # AlertTable, AlertDetail, AlertFilters
│       │       ├── incidents/        # IncidentTable, IncidentDetail, KillChain
│       │       ├── iocs/             # IOCTable, IOCDetail, IOCFilters
│       │       ├── playbooks/        # PlaybookList, PlaybookDetail, RunHistory
│       │       ├── endpoints/        # EndpointTable, EndpointDetail, ProcessTree
│       │       ├── mitre/            # MitreMatrix, TechniqueCard
│       │       └── detections/       # DetectionRuleList, RuleDetail
│       └── pages/                    # Route başına bir page komponenti
│           ├── Overview.tsx
│           ├── Alerts.tsx
│           ├── AlertDetail.tsx
│           ├── Incidents.tsx
│           ├── IncidentDetail.tsx
│           ├── IOCs.tsx
│           ├── Playbooks.tsx
│           ├── PlaybookDetail.tsx
│           ├── Endpoints.tsx
│           ├── EndpointDetail.tsx
│           ├── Mitre.tsx
│           ├── Detections.tsx
│           └── Settings.tsx
│
├── scripts/                          # Python pipeline
│   ├── build_dataset.py              # Tek entry point (--seed, --out)
│   ├── normalize.py
│   ├── pseudonymize.py
│   ├── generate_incidents.py
│   ├── extract_iocs.py
│   ├── enrich_mitre.py
│   ├── requirements.txt
│   └── README.md
│
├── data/
│   ├── raw/                          # Ham log kaynakları (değişmez)
│   ├── normalized/                   # Pipeline çıktısı (commit'li, canonical)
│   │   ├── alerts.json
│   │   ├── incidents.json
│   │   ├── iocs.json
│   │   ├── assets.json
│   │   ├── users.json
│   │   ├── playbook_runs.json
│   │   ├── detection_rules.json
│   │   └── mitre_coverage.json
│   ├── iocs/                         # IOC kaynak listeleri (feed)
│   └── legacy/                       # Eski pipeline çıktıları (referans, .gitignore'a eklenebilir)
│
├── detections/                       # Sigma/YAML kuralları
│   ├── rules/
│   └── queries/
│
├── docs/
│   ├── ANALYSIS.md                   # Faz 0 çıktısı
│   ├── ARCHITECTURE.md               # Bu dosya
│   ├── DATA_MODEL.md                 # Canonical schema
│   ├── TYPE_DEBT.md                  # Tip borcu envanteri
│   ├── SCENARIOS.md                  # Incident senaryo anlatımları (Faz 5)
│   └── CONTRIBUTING.md               # (opsiyonel)
│
├── README.md
└── LICENSE
```

---

## 2. Routing Tree

```
HashRouter
├── /                         → Overview (dashboard)
├── /alerts                   → Alerts (list + filter)
│   └── /alerts/:id           → AlertDetail
├── /incidents                → Incidents (list + filter)
│   └── /incidents/:id        → IncidentDetail (kill chain, timeline, evidence)
├── /iocs                     → IOCExplorer (list + filter by type)
├── /playbooks                → PlaybookList
│   └── /playbooks/:id        → PlaybookDetail (steps + run history)
├── /endpoints                → EndpointList (EDR)
│   └── /endpoints/:id        → EndpointDetail (process tree, detections)
├── /mitre                    → MitreMatrix (ATT&CK tactics × techniques)
├── /detections               → DetectionRuleList
└── /settings                 → Settings (theme, density, easter eggs)
```

Tüm route'lar lazy-load edilecek (`React.lazy` + `Suspense`).

---

## 3. State Management (Zustand)

### Store Stratejisi

Her entity için ayrı store, her store kendi data'sını yönetir:

| Store | Entity | Sorumluluk |
|---|---|---|
| `alertStore` | `Alert[]` | Alert listesi, filtreleme, seçili alert |
| `incidentStore` | `Incident[]` | Incident listesi, seçili incident, filtreleme |
| `iocStore` | `IOC[]` | IOC listesi, tip filtreleme, seçili IOC |
| `assetStore` | `Asset[]` | Endpoint listesi, seçili asset |
| `userStore` | `User[]` | Kullanıcı profilleri |
| `playbookStore` | `PlaybookRun[]` | Playbook tanımları + çalıştırma geçmişi |
| `detectionStore` | `DetectionRule[]` | Sigma kuralları |
| `mitreStore` | `MitreCoverage` | MITRE matrisi, technique-tactic mapping |
| `uiStore` | UI durumu | Sidebar collapsed, active drawer, search query, theme |
| `settingsStore` | `Settings` | Persisted (localStorage): theme, language, density |

### Prensipler
- **Her store kendi verisini fetch eder.** Global "useData" yok. `data.ts`'teki `fetchEntity<T>()` her store'un `load()` action'ından çağrılır.
- **Fetch-on-navigate.** Sayfa değişince ilgili store'un `load()`'u tetiklenir. Veri in-memory cache'lenir (`fetchEntity` ikinci çağrıda promise döndürmez, cached döner).
- **`settingsStore` ve `uiStore` zustand persist middleware kullanır.** localStorage'a yazılır.
- **Entity store'ları persist edilmez.** Her sayfa yüklemede JSON fetch eder.

### Örnek Store Yapısı

```ts
// alertStore.ts
interface AlertState {
  alerts: Alert[]
  selectedId: string | null
  filters: AlertFilters
  isLoading: boolean
  error: string | null

  load: () => Promise<void>
  selectAlert: (id: string) => void
  setFilters: (filters: Partial<AlertFilters>) => void
  clearSelection: () => void
}
```

---

## 4. Data Fetch Stratejisi

### `lib/data.ts` — Merkezi Fetch Layer

```ts
// Tek tip fetch fonksiyonu
async function fetchJSON<T>(filename: string): Promise<T> {
  const base = import.meta.env.BASE_URL
  const res = await fetch(`${base}data/${filename}`)
  if (!res.ok) throw new Error(`Failed to load ${filename}`)
  return res.json()
}

// In-memory cache
const cache = new Map<string, unknown>()

// Her store'un load() action'ı:
export async function loadEntity<T>(filename: string): Promise<T> {
  if (cache.has(filename)) return cache.get(filename) as T
  const data = await fetchJSON<T>(filename)
  cache.set(filename, data)
  return data
}
```

### Neden SWR/React Query Yok?
- Veri statik, revalidate gerekmez.
- GitHub Pages'te backend yok.
- `useEffect` + Zustand yeterli.
- Ek dependency istemiyoruz.

---

## 5. Design System

### Token Katmanları
1. **CSS Custom Properties** (`:root` / `.dark`) — renkler, radius, shadow
2. **Tailwind `extend`** — custom renkler (severity, status), font, animasyon

### Renk Paleti
| Token | Açıklama |
|---|---|
| `--severity-critical` | `#f85149` (kırmızı) |
| `--severity-high` | `#f0883e` (turuncu) |
| `--severity-medium` | `#d29922` (sarı) |
| `--severity-low` | `#3fb950` (yeşil) |
| `--severity-info` | `#8b949e` (gri) |
| `--status-open` | `#f0883e` |
| `--status-investigating` | `#58a6ff` (mavi) |
| `--status-contained` | `#d29922` |
| `--status-closed` | `#3fb950` |
| `--status-false-positive` | `#8b949e` |

### Tailwind Extend
```js
colors: {
  severity: {
    critical: 'var(--severity-critical)',
    high:     'var(--severity-high)',
    medium:   'var(--severity-medium)',
    low:      'var(--severity-low)',
    info:     'var(--severity-info)',
  },
  status: { ... }
}
```

Kullanım: `bg-severity-critical`, `text-status-investigating`, `border-severity-high`

---

## 6. Dark Mode (Default)

- `<html class="dark">` varsayılan.
- `settingsStore.theme` `'dark'` | `'light'` | `'system'`.
- `useTheme` hook'u `<html>`'e `.dark` class'ını toggle'lar.
- Tüm stiller `.dark` ve `:root` üzerinden CSS custom properties ile.
- Tailwind `darkMode: 'class'` konfigürasyonu.

---

## 7. Bundle & Code Splitting

- Her sayfa `React.lazy(() => import(...))` ile lazy load.
- `lib/data.ts` ana chunk'ta.
- `components/ui/` primitifleri ana chunk'ta (her sayfada kullanılır).
- Recharts lazy load (charts chunk).
- Hedef: initial bundle ≤ 200KB gzipped.

---

## 8. Erişilebilirlik

- Tüm interactive element'ler `role` + `aria-label`.
- Severity badge: ikon + renk + metin (renk tek başına bilgi taşımasın).
- Drawer: `Escape` kapatır, focus trap.
- DataTable: keyboard navigasyon (tab, enter).
- Skip link (görünmez, ilk tab'da).
- `prefers-reduced-motion` için animasyon disable.
