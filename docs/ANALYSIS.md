# Faz 0 — Mevcut Durum Analizi

> SOC Case Study Project — Keşif Raporu  
> Tarih: 2026-05-24

---

## 1. Mevcut Mimari (Kısa Şema)

```
SOC-case-study-project/
├── frontend/          ← React + Vite + TS + Tailwind (HEDEFLENEN UI)
│   ├── src/
│   │   ├── pages/     (19 sayfa, çoğu placeholder/taslak)
│   │   ├── components/ (Radix UI tabanlı primitifler)
│   │   ├── store/      (5 Zustand store)
│   │   ├── hooks/      (useData, useTheme, useLocalStorage)
│   │   ├── lib/        (utils, mockData)
│   │   └── types/      (200+ satır, karışık)
│   └── public/dashboard_data/ ← pipeline çıktısının kopyası
│
├── dashboard/         ← ESKI VANILLA JS DASHBOARD (Phase 1 ürünü)
│   ├── index.html      (tek HTML shell)
│   ├── app.js          (1194 satır monolithic JS)
│   ├── styles.css      (2000+ satır custom CSS)
│   └── dashboard_data/ ← aynı verinin başka bir kopyası
│
├── src/               ← Python pipeline modülleri
│   ├── turkish_soc_generator.py   (1200+ satır, Türkçe senaryolu)
│   ├── synthetic_data_generator.py (1200 satır, İngilizce, ~DUPLICATE)
│   ├── normalize/      (dataset normalizasyon modülü)
│   ├── correlate.py, detect.py, ingest.py …
│   └── playbooks/      (3 YAML playbook)
│
├── data/
│   ├── raw/            (5 ham log dosyası)
│   ├── normalized/     (events.jsonl, ~3500 olay)
│   └── iocs/           (malicious domain/IP listeleri)
│
├── outputs/            ← pipeline çıktısı (13 dosya)
├── detections/         ← Sigma/YAML kuralları
├── documentation/      ← Incident raporları (MD)
│
├── run_pipeline.py     ← Ana orchestrator
├── generate_fast_data.py ← Hızlı veri üretimi
├── trim_data.py        ← JSON trimmer
└── trim_jsonl.py       ← JSONL trimmer
```

### Veri Akışı

```
Raw logs (data/raw/)      External datasets (datasets/)
        │                        │
        ▼                        ▼
  turkish_soc_generator    normalize/
  (synthetic events)       (pseudonymize + canonical)
        │                        │
        └────────┬───────────────┘
                 ▼
         run_pipeline.py
                 │
                 ▼
          outputs/ (13 files)
                 │
        ┌────────┴────────┐
        ▼                 ▼
  frontend/public/    dashboard/dashboard_data/
```

---

## 2. Tutulacak Parçalar

| Parça | Gerekçe |
|---|---|
| **`frontend/` React uygulaması** | Modern stack (Vite + TS + Tailwind + Zustand). HashRouter doğru. Genişletilebilir component mimarisi var. |
| **`src/turkish_soc_generator.py`** | Türkçe kurgusal şirket/domain ekosistemi tam istenen gibi. 9 senaryo mevcut. Deterministik seed var. |
| **`src/normalize/` modülü** | Gerçek SIEM formatlarını canonical şemaya çeviren sağlam bir pipeline. `pseudo.py` pseudonymization güzel yazılmış. |
| **`data/raw/` ham loglar** | Pipeline için kaynak veri. Tutulması gerek. |
| **`data/iocs/` IOC listeleri** | Phishing URL dataset'leri pipeline'a besleniyor. |
| **`detections/` kurallar** | Sigma-format detection rule'lar, MITRE mapping'li. Kaliteli. |
| **`documentation/`** | Incident senaryoları, timeline, MITRE mapping, playbook'lar. Hepsi iyi yazılmış Türkçe içerik. |
| **GitHub Actions `deploy.yml`** | `frontend/`'i build edip GitHub Pages'e deploy ediyor. Doğru workflow. |
| **`README.md`** | Mizahi ton korunmuş, Türkçe. Projenin ruhunu yansıtıyor. |
| **Zustand store yapısı** | 5 store (data, UI, settings, EDR, SOAR, saved-searches). İyi ayrışmış. |

---

## 3. Atılacak / Replace Edilecek Parçalar

| Parça | Gerekçe |
|---|---|
| **`dashboard/` klasörü (tamamen)** | Eski vanilla JS sürümü. `frontend/` ile duplikasyon. Her iki klasörde de `dashboard_data/` kopyaları var. Kafa karıştırıcı. Silinecek. |
| **`src/synthetic_data_generator.py`** | `turkish_soc_generator.py` ile ~%90 duplicate. İngilizce (`acmecorp.com`, "Sarah Chen"). Yeni brief Türkçe istiyor. Silinecek. |
| **`.github/workflows/static.yml`** | Eski `dashboard/` workflow'u. `deploy.yml` zaten doğru olan. Silinecek. |
| **`frontend/public/dashboard_data/summary.json`** | İçinde `acmecorp.com` domainleri var. Pipeline yeniden çalıştırılınca override olacak. |
| **`outputs/` klasörü** | Pipeline'ın ürettiği çıktılar. Repo'da tutulması gerekmez (`.gitignore`'a eklenip pipeline ile regenerate edilmeli). Alternatif: taahhüt edilmiş halini koru ama `data/normalized/` altında canonical olarak tut. |
| **`@tremor/react` dependency** | 19 sayfada sadece 3-4 yerde kullanılıyor (ExecutiveOverview, ComplianceDashboard, UserAnalytics). Bundle'a ~200KB ekliyor. Tailwind ile replace edilebilir. |
| **`react-force-graph-3d` + `three`** | Sadece `AttackMap.tsx`'te kullanılıyor. Bundle'a ~600KB ekliyor. Aşırı heavy. |
| **`react-simple-maps` + `topojson-client`** | Sadece `AttackMap.tsx`'te. |
| **`@monaco-editor/react`** | Sadece `SigmaRules.tsx`'te. |
| **`framer-motion`** | Birkaç yerde `motion.div` var. Tailwind animasyonlarıyla replace edilebilir. |
| **`@headlessui/react`** | Zaten Radix UI var, ikisi birden aşırı. |
| **`class-variance-authority`** | Kullanılmıyor gibi, sadece import var. |
| **`@remixicon/react`** | lucide-react varken ikinci ikon kütüphanesi gereksiz. |
| **Root'taki Python dosyaları** | `generate_fast_data.py`, `trim_data.py`, `trim_jsonl.py` — tek seferlik yardımcı scriptler. Pipeline reorganize edilince mantıklı yere taşınacak. |

---

## 4. Belirsiz / Teknik Borç Noktaları

### 4.1 Tip Güvenliği
- `useData.ts:71`: `store.setData(FILES[index].prop as any, result.value)` — `any` cast var.
- `mockData.ts`: `Record<string, unknown>` tipler eksik.
- `types/index.ts`: `Event.user` için `string | { id?: string; … } | undefined` — union type kaosu. Her yerde farklı shape.
- `IOC.value`/`IOC.indicator`/`IOC.domain` — aynı şey için 3 farklı field. Schema standardizasyonu lazım.

### 4.2 Mimari Borç
- **19 sayfa, 5'i işlevsel.** Overview, Alerts, Events, Devices, Automations, Timeline, Mitre, Intel, Reports çalışıyor. ExecutiveOverview, ThreatIntelligence, UserAnalytics, ComplianceDashboard, AttackMap, Investigation, CaseDetails, SigmaRules, Settings ya boş ya da taslak.
- **Sayfa routing'i dağınık.** Brief'teki `/alerts/:id`, `/incidents/:id` gibi route'lar yok. Her şey flat.
- **Drawer mimarisi limitli.** Sadece `alert` ve `device` için drawer var. Incident detay sayfası yok, IOC detay yok.
- **İki farklı UI sistemi.** Radix UI primitives + Tremor components + Headless UI. 3 ayrı component kütüphanesi. Tailwind ile sadeleştirilmeli.
- **Inline style kullanımı** (`style={{width:400}}`, `style={{fontSize: 'var(--text-xs)'}}`). Brief'te yasaklanmış.

### 4.3 Veri Borcu
- **`frontend/public/dashboard_data/`** pipeline çıktısının kopyası. Bu dosyalar `.gitignore`'da değil. Build sırasında `public/` altındaki her şey kopyalanıyor, bundle şişiyor.
- **JSONL vs JSON tutarsızlığı.** Bazı dosyalar JSONL (`alerts.jsonl`), bazıları JSON (`cases.json`). Frontend ikisini de parse ediyor ama schema'lar farklı.
- **Canonical schema yok.** `turkish_soc_generator.py`'nin ürettiği event ile `normalize/` modülünün ürettiği event farklı yapıda.
- **Seed yönetimi:** `SEED = int(os.environ.get('SOC_SEED', '1337'))` — seed var ama `build_dataset.py` gibi tek entry point yok.

### 4.4 Tailwind Config Borcu
- **Safelist 1800+ class generate ediyor.** Debug build'lerde CSS dosyası 100KB+.
- **Tremor renk token'ları** + shadcn token'ları + custom neon token'lar. 3 ayrı design token sistemi.
- Dark mode varsayılan ama light mode CSS custom property'leri de yüklü.

### 4.5 Erişilebilirlik
- `aria-label` kullanımı sparse. Tooltip'ler hariç çoğu interactive element'te yok.
- Tab order test edilmemiş.
- Renk tek başına bilgi taşıyor (severity badge'lerinde ikon yok).
- Klavye navigasyonu sadece `Ctrl+K` için var, drawer'larda `Escape` handle edilmemiş.

### 4.6 GitHub Pages
- `vite.config.ts`'te `base: '/SOC-case-study-project/'` hardcoded. Brief `import.meta.env.BASE_URL` istiyor.
- `useData.ts`'te `const DATA_BASE_PATH = './dashboard_data'` — asset path'i `import.meta.env.BASE_URL` kullanmıyor.

---

## 5. Önerilen Yeni Klasör Yapısı

```
SOC-case-study-project/
├── frontend/                  ← Tek UI (React app)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── public/
│   │   ├── shield.svg
│   │   └── data/              ← Pipeline çıktısı (build sırasında kopyalanır)
│   │       ├── alerts.json
│   │       ├── incidents.json
│   │       ├── iocs.json
│   │       ├── assets.json
│   │       ├── users.json
│   │       ├── playbook_runs.json
│   │       ├── detections.json
│   │       └── mitre_coverage.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── styles/
│       │   └── tokens.css     ← Tüm design token'lar burada
│       ├── lib/
│       │   ├── utils.ts       ← cn, formatTime, …
│       │   └── data.ts        ← Tüm data fetching + cache
│       ├── store/
│       │   └── index.ts       ← Zustand store'lar
│       ├── types/
│       │   └── index.ts       ← Canonical schema
│       ├── hooks/
│       │   └── index.ts       ← useData, useTheme
│       ├── components/
│       │   ├── ui/            ← Primitifler (Card, Badge, Button, …)
│       │   ├── layout/        ← Sidebar, Topbar, Shell
│       │   └── features/      ← Sayfa-spesifik komponentler
│       │       ├── dashboard/
│       │       ├── alerts/
│       │       ├── incidents/
│       │       ├── iocs/
│       │       ├── playbooks/
│       │       ├── endpoints/
│       │       └── mitre/
│       └── pages/             ← Route başına bir page
│
├── scripts/                   ← Tüm Python pipeline
│   ├── build_dataset.py       ← Tek entry point
│   ├── normalize.py
│   ├── pseudonymize.py
│   ├── generate_incidents.py
│   ├── extract_iocs.py
│   ├── enrich_mitre.py
│   └── requirements.txt       ← Pinli bağımlılıklar
│
├── data/
│   ├── raw/                   ← Ham log kaynakları (değişmez)
│   ├── normalized/            ← Pipeline çıktısı (canonical, commit'li)
│   │   ├── alerts.json
│   │   ├── incidents.json
│   │   ├── iocs.json
│   │   ├── assets.json
│   │   ├── users.json
│   │   ├── playbook_runs.json
│   │   ├── detections.json
│   │   └── mitre_coverage.json
│   ├── iocs/                  ← IOC kaynak listeleri
│   └── legacy/                ← Eski format veri (referans)
│
├── docs/
│   ├── ANALYSIS.md            ← Bu dosya
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── SCENARIOS.md
│   └── CONTRIBUTING.md
│
├── detections/                ← Sigma/YAML kuralları (korunur)
├── .github/workflows/
│   └── deploy.yml             ← Tek deploy workflow
├── README.md
└── LICENSE
```

### Silinecekler:
- `dashboard/` (tamamen)
- `outputs/` (`.gitignore`'a ekle, pipeline ile regenerate)
- `src/synthetic_data_generator.py`
- `.github/workflows/static.yml`
- `frontend/public/dashboard_data/` (yerine `frontend/public/data/`)
- `generate_fast_data.py`, `trim_data.py`, `trim_jsonl.py` (root'taki)
- `run_pipeline.py` (yerine `scripts/build_dataset.py`)
- `DASHBOARD_V2.md` (dokümantasyon docs/ altında toplanacak)

---

## 6. Öncelikli Aksiyonlar (Özet)

1. **Duplikasyonu bitir:** `dashboard/` sil, `frontend/` tek UI olsun.
2. **Schema'yı standardize et:** `types/index.ts`'i temizle, her entity için tek canonical tip.
3. **Pipeline'ı düzelt:** `scripts/build_dataset.py` tek entry point, seed parametrik.
4. **Data dosyalarını düzelt:** Hepsi JSON, tutarlı schema, ölçeklenebilir boyut.
5. **Bağımlılıkları temizle:** Tremor, 3D-force-graph, monaco-editor, simple-maps, headlessui, remixicon, framer-motion, cva çıksın.
6. **Route yapısını brief'e uydur:** `/alerts/:id`, `/incidents/:id` ekle.
7. **Sayfaları tamamla:** 19 boş sayfadan 10 işlevsel sayfaya indirge.
