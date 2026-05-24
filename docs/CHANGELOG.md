# Changelog

## v2.1.0 — Weekend Power Features (2026-05-26)

### New Features

- **Forensic Pivot Navigation:** IP, user, asset, hostname columns clickable across all tables. URL param sync with filter breadcrumbs. Reverse-pivot sidebar on Alert detail.
- **AI-Powered Triage Summary:** Pre-generated Turkish narratives for 6 alerts + 3 incidents. Typewriter animation, fake loading sequence, confidence bar, checkboxable next steps. Zero backend.
- **Entity Investigation Graph:** reactflow-based node-edge graph on Incident detail. User → Asset → Alert → IOC → MITRE relationships. Pan/zoom, minimap, clickable nodes.
- **Geo Threat Map:** Inline SVG world map with animated pulse markers. 7 threat origins. Hover tooltip + click pivot to filtered alerts. Zero deps.
- **Command Palette (Ctrl+K):** cmdk-powered global search. Fuzzy search with Turkish char normalization. Groups: pages, alerts, incidents, actions.
- **Sigma Highlighting + CSV/JSON Export:** Custom YAML syntax highlighter (zero deps). Filtered CSV/JSON export on table pages.

### Polish

- Build: tsconfig `noUnusedLocals`/`noUnusedParameters` strict
- All 6 features lazy-loaded where heavy
- Mobile-friendly fallbacks for graph
- Zero regression on Phase 0-7 features

### Dependencies

- Added: `cmdk` (~10KB gzipped), `reactflow` (~50KB gzipped, lazy)
- Total initial bundle increase: ~10KB gzipped

---

## v2.0.0 — Full Rework (2026-05-24)

Complete rewrite from legacy vanilla JS dashboard to React + TypeScript + Tailwind.

- 13 lazy-loaded routes (HashRouter)
- 10 Zustand entity stores
- 9 incident scenarios with Turkish narratives
- MITRE ATT&CK matrix widget
- SOAR playbook DAG flow
- EDR endpoint process tree
- IOC defanging + threat score bars
- Dark mode (default) + accessibility (skip link, landmark roles, ARIA)
- Python data pipeline (seed-deterministic, stdlib-only)
- GitHub Actions deploy (native actions/deploy-pages@v4)
