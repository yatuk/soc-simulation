# SOC Dataset Pipeline

Deterministik, reproducible SOC veri üretim hattı.

## Gereksinimler

- Python 3.10+
- Harici bağımlılık yok (stdlib-only)

## Kullanım

```bash
# Tam veri seti üret (tüm 9 incident)
python scripts/build_dataset.py --seed 42 --out data/normalized/

# Test modu (sadece 3 incident)
python scripts/build_dataset.py --seed 42 --limit 3 --out data/normalized/

# UTF-8 modu (Windows'ta encoding sorunu yaşanırsa)
python -X utf8 scripts/build_dataset.py --seed 42 --out data/normalized/
```

## Çıktılar

| Dosya | İçerik |
|---|---|
| `alerts.json` | 19 alert (9 incident'a bağlı) |
| `incidents.json` | 9 incident (kill chain adımları, Türkçe narrative) |
| `iocs.json` | 24 IOC (domain, IP, hash) |
| `assets.json` | 25 endpoint (workstation, laptop, server, mobile) |
| `users.json` | 15 kullanıcı (risk skorlu) |
| `playbook_definitions.json` | 4 SOAR playbook tanımı |
| `playbook_runs.json` | 9 playbook çalıştırma kaydı |
| `detection_rules.json` | 8 Sigma kuralı |
| `mitre_coverage.json` | MITRE ATT&CK kapsam matrisi |
| `kpi_metrics.json` | Dashboard KPI özeti |

## Modüller

```
scripts/
├── build_dataset.py        # Ana orchestrator (tek entry point)
├── generate_incidents.py   # 9 incident senaryosu + alert + playbook + rule
├── extract_iocs.py         # IOC çıkarma (domain, IP, hash)
├── enrich_mitre.py         # MITRE ATT&CK kapsam hesaplama
├── normalize.py            # Varlık profilleri + KPI metrikleri
├── pseudonymize.py         # ID üretimi + defang helper'ları
├── _data.py                # Paylaşılan sabitler (kullanıcılar, cihazlar, MITRE)
├── requirements.txt        # Bağımlılık listesi (stdlib-only)
└── README.md               # Bu dosya
```

## Seed ile Reproducibility

Aynı seed aynı veriyi üretir:

```bash
python scripts/build_dataset.py --seed 42  # Her zaman aynı 19 alert, 9 incident
python scripts/build_dataset.py --seed 99  # Farklı seed = farklı risk skorları, timestamp'ler
```

## Schema

Tüm çıktılar `docs/DATA_MODEL.md`'de tanımlanan canonical schema'ya uygundur.
