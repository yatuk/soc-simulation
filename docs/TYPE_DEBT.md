# Type Safety Debt Inventory

> Generated during Phase 0 analysis. All `any` casts and type issues catalogued.

## `any` Types (`grep -rn "as any\|: any" frontend/src`)

| # | File | Line | Code | Severity | Page Status |
|---|---|---|---|---|---|
| 1 | `hooks/useData.ts` | 71 | `store.setData(FILES[index].prop as any, result.value)` | HIGH | ✅ KALICI |
| 2 | `pages/ExecutiveOverview.tsx` | 67 | `decorationColor={kpi.color as any}` | LOW | ❌ Silinecek sayfa |
| 3 | `pages/ComplianceDashboard.tsx` | 175 | `colors={[req.color as any]}` | LOW | ❌ Silinecek sayfa |
| 4 | `pages/CaseDetails.tsx` | 105 | `as any[]` | LOW | ❌ Silinecek sayfa |
| 5 | `pages/Investigation.tsx` | 42 | `(node: any)` | LOW | ❌ Silinecek sayfa |
| 6 | `pages/Investigation.tsx` | 107 | `(node: any)` | LOW | ❌ Silinecek sayfa |
| 7 | `react-simple-maps.d.ts` | 7,8,17,23 | 4x library declaration | N/A | ❌ Silinecek dep |

**Net: Silinecek sayfalar gidince geriye sadece `useData.ts:71` kalıyor.**

## Fix plan for `useData.ts:71`

```ts
// Current:
store.setData(FILES[index].prop as any, result.value)

// Fix: type-safe setData with generic constraint
// Option A: type-narrow the key parameter
// Option B: switch-case per config entry  
// Option C: zod schema validation at fetch boundary
// → Decision in Phase 3 (Frontend Foundation)
```

## IOC Field Confusion

Current `IOC` interface has 3 overlapping fields:
```ts
interface IOC {
  value: string       // canonical
  indicator?: string  // alias (Intel.tsx kullanıyor)
  domain?: string     // another alias (some datasets)
}
```

**Resolution (Phase 1 DATA_MODEL.md):**
```ts
interface IOC {
  ioc_id: string
  type: 'url' | 'domain' | 'ip' | 'hash' | 'email'
  value: string        // ← single canonical field
  label?: string       // human-readable (e.g. "C2 domain", "phishing URL")
  confidence: number   // 0-100
  severity?: Severity
  tags: string[]
  first_seen: string
  last_seen: string
  source: string       // dataset or pipeline that produced it
  related_alert_ids: string[]
}
```

## Event User Union Chaos

```ts
// Current:
user?: string | { id?: string; display?: string; email?: string }
// Every consumer checks: typeof event.user === 'string' ? event.user : event.user?.email

// Fix:
user: { user_id: string; email: string; display_name: string }
```

## Other Type Issues

- `Severity` is `string` union but also `number` in Alert (legacy data). → Normalize to `Severity` enum at data fetch boundary.
- `ProcessInfo` vs inline `process` field — same data, two shapes. → Single `ProcessInfo` type.
- `RiskScore.score` and `RiskScore.total_score` — duplicates. → Single `score: number`.
