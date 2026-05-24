# SOC Console — Mimari Dökümanı

> Son güncelleme: Faz 7 (build edilenle senkronize)

---

## 1. Klasör Yapısı (Final)

```
SOC-case-study-project/
├── .github/workflows/deploy.yml     # GitHub Actions → Pages
├── frontend/                        # React SPA
│   ├── index.html
│   ├── package.json                 # v2.0.0
│   ├── vite.config.ts               # base: /SOC-case-study-project/
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── public/
│   │   ├── data/                    # Pipeline çıktısı (10 JSON)
│   │   ├── favicon.svg
│   │   └── 404.html
│   └── src/
│       ├── main.tsx                 # HashRouter + TooltipProvider
│       ├── App.tsx                  # Routes + Layout shell + ErrorBoundary
│       ├── index.css                # Tailwind + CSS custom properties
│       ├── lib/
│       │   ├── data.ts              # fetch + in-memory cache
│       │   └── utils.ts             # cn(), defang(), formatters
│       ├── store/index.ts           # 10 Zustand store (entity-bazlı)
│       ├── types/index.ts           # 12 canonical interface
│       ├── hooks/                   # useTheme, useDocumentTitle
│       ├── components/
│       │   ├── ui/                  # 15 primitive (Card, Badge, Tooltip, ...)
│       │   ├── layout/              # Sidebar, Topbar, Drawer
│       │   └── features/
│       │       ├── dashboard/       # KpiCards, AlertVolumeChart, ...
│       │       └── alerts/          # AlertFilters
│       └── pages/                   # 13 lazy-loaded route
├── scripts/                         # Python pipeline (stdlib-only)
│   ├── build_dataset.py             # Tek entry point: --seed 42
│   ├── generate_incidents.py        # 9 senaryo
│   ├── extract_iocs.py
│   ├── enrich_mitre.py
│   ├── normalize.py
│   ├── pseudonymize.py
│   └── _data.py                     # Shared constants
├── data/
│   ├── raw/                         # Ham log kaynakları
│   ├── normalized/                  # Pipeline çıktısı (commit'li)
│   ├── iocs/                        # IOC feed listeleri
│   └── legacy/                      # Eski pipeline çıktıları
├── docs/                            # Mimari + veri modeli + senaryolar
├── detections/                      # Sigma/YAML kuralları
└── README.md
```

---

## 2. Routing Tree (Final — 13 Route)

```
HashRouter
├── /                         → Overview (dashboard)
├── /alerts                   → Alerts (filter + table)
│   └── /alerts/:id           → AlertDetail (MITRE + IOC + actions)
├── /incidents                → Incidents (filter + table)
│   └── /incidents/:id        → IncidentDetail (narrative + kill chain timeline)
├── /iocs                     → IOCExplorer (expandable cards)
├── /playbooks                → PlaybookList (cards + run table)
│   └── /playbooks/:id        → PlaybookDetail (DAG step flow + run history)
├── /endpoints                → Endpoints (EDR table)
│   └── /endpoints/:id        → EndpointDetail (process tree)
├── /mitre                    → MitreMatrix (tactic columns × technique cards)
├── /detections               → DetectionRules (expandable cards)
└── /settings                 → Settings (theme, density, MTTC)
```

Tüm route'lar `React.lazy` + `Suspense` ile lazy-load edilir.

---

## 3. State Management (10 Store)

| Store | Entity | Persist? | Sorumluluk |
|---|---|---|---|
| `useAlertStore` | `Alert[]` | ❌ | Alert listesi, filtreleme |
| `useIncidentStore` | `Incident[]` | ❌ | Incident listesi, filtreleme |
| `useIOCStore` | `IOC[]` | ❌ | IOC listesi, tip filtreleme |
| `useAssetStore` | `Asset[]` | ❌ | Endpoint listesi |
| `useUserStore` | `User[]` | ❌ | Kullanıcı profilleri |
| `usePlaybookDefStore` | `PlaybookDefinition[]` | ❌ | Playbook tanımları |
| `usePlaybookRunStore` | `PlaybookRun[]` | ❌ | Playbook çalıştırma kayıtları |
| `useDetectionStore` | `DetectionRule[]` | ❌ | Sigma kuralları |
| `useMitreStore` | `MitreCoverage` | ❌ | MITRE matrisi |
| `useKPIStore` | `KPIMetrics` | ❌ | Dashboard metrikleri |
| `useUIStore` | UI state | ❌ | Sidebar, drawer, theme |
| `useSettingsStore` | `Settings` | ✅ localStorage | Tema, dil, yoğunluk |

Factory pattern: `createEntityStore<T>(filename)` → 10 store generik şablondan üretilir.

---

## 4. Data Flow

```
JSON files (public/data/)
     │
     ▼ fetch()
lib/data.ts (in-memory Map cache)
     │
     ▼ loadEntity<T>()
Zustand store.load()
     │
     ▼ selector
React component
```

- Her store kendi `load()` action'ından `loadEntity<T>()` çağırır
- İkinci çağrıda cache'den döner, network yok
- `import.meta.env.BASE_URL` ile path çözümleme (GitHub Pages uyumlu)

---

## 5. Build & Deploy

```yaml
# .github/workflows/deploy.yml
push to main
  → setup-node@v4 (node 20, npm cache)
  → npm ci (working-directory: frontend)
  → npm run build
  → upload-pages-artifact (path: frontend/dist)
  → deploy-pages@v4
```

- `vite.config.ts`: `base: '/SOC-case-study-project/'`, `esbuild.drop: [console, debugger]`
- `manualChunks`: vendor (react + router), charts (recharts)
- Output: 30 files, ~200 KB gzipped JS, ~7 KB gzipped CSS

---

## 6. Bundle Size (Production Build)

| Chunk | Size | Gzip |
|---|---|---|
| vendor (react + router) | 164 KB | 53 KB |
| charts (recharts) | 411 KB | 111 KB |
| index (app shell + ui) | 81 KB | 25 KB |
| Overview | 12 KB | 4 KB |
| 12 lazy pages | 2-8 KB each | 1-3 KB each |
| CSS | 38 KB | 7 KB |
| **Total (all chunks)** | **~824 KB** | **~207 KB** |

---

## 7. Erişilebilirlik

| Feature | Implementasyon |
|---|---|
| Skip link | `#main-content` anchor, `sr-only focus:not-sr-only` |
| Landmark roles | `banner`, `navigation`, `main`, `complementary`, `contentinfo` |
| Keyboard nav | Tab order, Enter/Shift+Enter, Escape kapatma |
| Focus trap | Drawer + mobile sidebar |
| ARIA labels | Tüm icon-only button'lar + interactive element'ler |
| Color | Severity/status pill'leri ikon + renk + metin |
| Reduced motion | `prefers-reduced-motion` için CSS animasyon disable |
| Screen reader | Semantic HTML + `aria-busy` skeleton + `aria-expanded` toggle |

---

## 8. Tasarım Kararları (Why Not X?)

**Neden Redux değil Zustand?**
10 store × ortalama 3 action = 30 boilerplate. Zustand factory pattern ile 30 satırda biter, Redux 200+.

**Neden HashRouter, BrowserRouter değil?**
GitHub Pages SPA routing desteklemez. `/alerts` refresh edince 404 döner. HashRouter `#/alerts` her zaman `index.html` serve edilir.

**Neden Tremor/Material/Chakra değil?**
Bundle maliyeti. Tailwind + 5 kendi primitive'imiz = 38 KB CSS. Tremor tek başına 200 KB+.

**Neden Mock Service Worker yok?**
Statik JSON yeterli. Pipeline deterministic, "fake API" sahte zenginlik katmazdı.

**Neden testler yok?**
Portfolyo projesi, demo amaçlı. Test eklenecek olsa Playwright e2e mantıklı olur, unit test değil. Roadmap'te.
