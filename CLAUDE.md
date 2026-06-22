# SOC Simülasyon Dashboard — Claude Code Guide

**SOC Console** — Tamamen statik, frontend-only SOC (Security Operations Center) simülasyon platformu. SIEM, SOAR, EDR yeteneklerini demo amaçlı sergiler. Kurgusal "Anadolu Finans Holding" şirketi üzerinden senaryolar işlenir.

- **Live:** https://yatuk.github.io/soc-simulation/
- **Stack:** React 18 + TypeScript (strict) + Vite 5 + Tailwind CSS 3 + Zustand 4 + Python 3.10+
- **Domain:** SIEM alert yönetimi, incident response, SOAR playbook otomasyonu, EDR endpoint monitoring, IOC intelligence, MITRE ATT&CK mapping

## Kritik Bilgiler

- **HashRouter:** GitHub Pages SPA uyumluluğu için BrowserRouter değil HashRouter kullanılır
- **Statik Veri:** Tüm veri `frontend/public/data/*.json` dosyalarından gelir — backend yok
- **Pipeline:** `scripts/build_dataset.py` → python stdlib-only, bağımlılık yok
- **Base path:** Vite config'de `base: '/soc-simulation/'` — asset path'leri buna göre

## Agent'lar

Proje `.claude/agents/` altında 5 özel agent içerir:

| Agent | Dosya | Rolü |
|-------|-------|------|
| Team Lead | `team-lead.md` | Mimari, PR review, iş dağılımı |
| Security Engineer | `security-engineer.md` | Detection rules, MITRE, playbook, IOC |
| Frontend Dev | `frontend-dev.md` | React/TS component'ler, UI/UX |
| Python Dev | `python-dev.md` | Veri pipeline'ı, sentetik veri üretimi |
| QA Tester | `qa-tester.md` | Test, accessibility, regression |

## Hızlı Komutlar

```bash
cd frontend && npm run dev       # Dev server (http://localhost:5173/soc-simulation/)
cd frontend && npm run build     # Production build
cd frontend && npx tsc --noEmit # TypeScript tip kontrolü
python scripts/build_dataset.py  # Veri pipeline'ını çalıştır
```

## Önemli Dosyalar

- Mimari: `docs/ARCHITECTURE.md`
- Veri modeli: `docs/DATA_MODEL.md`
- TypeScript tipleri: `frontend/src/types/index.ts`
- Zustand store'lar: `frontend/src/store/index.ts`
- Routing: `frontend/src/App.tsx`
- Data cache: `frontend/src/lib/data.ts`
- CSS tokens: `frontend/src/index.css`
- Pipeline ana: `scripts/build_dataset.py`
- Detection kuralları: `detections/rules/*.yaml`
- Playbook tanımları: `src/playbooks/*.yaml`
