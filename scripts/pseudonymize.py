"""
Pseudonymization and defanging helpers.
Deterministic — same seed = same output.
"""
import hashlib

# ── ID generators ────────────────────────────────────────────
def make_alert_id(incident_id: str, seq: int) -> str:
    """ALR-0001-001"""
    return f"ALR-{incident_id[-4:]}-{seq:03d}"

def make_incident_id(seq: int) -> str:
    """INC-2026-0001"""
    return f"INC-2026-{seq:04d}"

def make_ioc_id(ioc_type: str, value: str) -> str:
    """IOC-DOM-a1b2c3d4"""
    h = hashlib.sha256(value.lower().encode()).hexdigest()[:8]
    return f"IOC-{ioc_type.upper()}-{h}"

def make_run_id(seq: int) -> str:
    """RUN-1001"""
    return f"RUN-{1000 + seq}"

def make_rule_id(seq: int) -> str:
    """RULE-MAILBOX-001"""
    return f"RULE-{seq:04d}"

# ── Defang helpers ───────────────────────────────────────────
def defang_url(url: str) -> str:
    """hxxps://evil[.]example[.]tk/path"""
    return url.replace("http://", "hxxp://").replace("https://", "hxxps://").replace(".", "[.]")

def defang_domain(domain: str) -> str:
    """evil[.]example[.]tk"""
    return domain.replace(".", "[.]")

def defang_ip(ip: str) -> str:
    """198[.]51[.]100[.]45"""
    return ip.replace(".", "[.]")
