#!/usr/bin/env python3
"""
SOC Dataset Builder — Deterministic pipeline orchestrator.
Produces canonical JSON datasets for the SOC Console frontend.

Usage:
    python scripts/build_dataset.py --seed 42 --out data/normalized/
    python scripts/build_dataset.py --seed 42 --limit 5   # test mode, fewer incidents
"""
import argparse
import json
import random
import sys
from datetime import datetime
from pathlib import Path

# Add scripts/ to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from generate_incidents import IncidentGenerator
from extract_iocs import extract_iocs
from enrich_mitre import build_mitre_coverage
from normalize import generate_users, generate_assets, generate_kpi_metrics


def parse_args():
    p = argparse.ArgumentParser(description="SOC Dataset Builder")
    p.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    p.add_argument("--out", type=str, default="data/normalized/", help="Output directory")
    p.add_argument("--limit", type=int, default=0, help="Limit incident count (0 = all)")
    return p.parse_args()


def save_json(data, out_dir: Path, filename: str):
    fp = out_dir / filename
    with open(fp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  [OK] {filename} ({len(data) if isinstance(data, list) else 'obj'} entries)")


def main():
    args = parse_args()

    # Seeeeed
    random.seed(args.seed)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    project_root = Path(__file__).parent.parent

    print("=" * 60)
    print("SOC DATASET BUILDER")
    print(f"  Seed: {args.seed}")
    print(f"  Out:  {out_dir}")
    print(f"  Time: {datetime.now().isoformat()}")
    print("=" * 60)

    # Step 1: Generate incidents + alerts + playbooks + detection rules
    print("\n[1/5] Senaryolar üretiliyor...")
    gen = IncidentGenerator()
    data = gen.generate_all()

    incidents = data["incidents"]
    alerts = data["alerts"]

    if args.limit:
        incidents = incidents[: args.limit]
        # Keep only alerts linked to surviving incidents
        surviving_ids = {inc["incident_id"] for inc in incidents}
        alerts = [a for a in alerts if a["incident_id"] in surviving_ids]
        data["playbook_runs"] = [r for r in data["playbook_runs"] if r["incident_id"] in surviving_ids]

    print(f"  -> {len(alerts)} alerts, {len(incidents)} incidents")
    print(f"  -> {len(data['playbook_definitions'])} playbook definitions, {len(data['playbook_runs'])} runs")
    print(f"  -> {len(data['detection_rules'])} detection rules")

    # Step 2: Extract IOCs
    print("\n[2/5] IOC'ler çıkarılıyor...")
    iocs = extract_iocs(project_root, alerts)
    print(f"  -> {len(iocs)} IOCs")

    # Step 3: Build MITRE coverage
    print("\n[3/5] MITRE ATT&CK kapsamı hesaplanıyor...")
    mitre_coverage = build_mitre_coverage(alerts, incidents)
    covered = mitre_coverage["summary"]["covered_techniques"]
    total = mitre_coverage["summary"]["total_techniques"]
    print(f"  -> {covered}/{total} teknik cover edildi")

    # Step 4: Generate entity profiles + KPI metrics
    print("\n[4/5] Varlık profilleri ve metrikler üretiliyor...")
    users = generate_users(alerts, incidents)
    assets = generate_assets(alerts, incidents)
    kpi = generate_kpi_metrics(alerts, incidents, users, assets, data["playbook_runs"])
    print(f"  -> {len(users)} users, {len(assets)} assets")

    # Step 5: Write all output files
    print(f"\n[5/5] Çıktılar {out_dir} dizinine yazılıyor...")
    save_json(alerts, out_dir, "alerts.json")
    save_json(incidents, out_dir, "incidents.json")
    save_json(iocs, out_dir, "iocs.json")
    save_json(assets, out_dir, "assets.json")
    save_json(users, out_dir, "users.json")
    save_json(data["playbook_definitions"], out_dir, "playbook_definitions.json")
    save_json(data["playbook_runs"], out_dir, "playbook_runs.json")
    save_json(data["detection_rules"], out_dir, "detection_rules.json")
    save_json(mitre_coverage, out_dir, "mitre_coverage.json")
    save_json(kpi, out_dir, "kpi_metrics.json")

    print(f"\n{'=' * 60}")
    print(f"TAMAMLANDI — {datetime.now().isoformat()}")
    print(f"Çıktı: {out_dir}")
    print(f"{'=' * 60}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
