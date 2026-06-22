import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { loadEntity } from '@/lib/data'
import { useTranslation } from '@/i18n'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { SeverityPill } from '@/components/ui/severity-pill'
import { StatusPill } from '@/components/ui/status-pill'
import { ArrowLeft, User, Monitor, Target, FileText } from 'lucide-react'

interface Case {
  case_id: string; title: string; severity: string; status: string
  owner: string; created_at: string; updated_at: string
  affected_users: string[]; affected_devices: string[]
  mitre_techniques: string[]; narrative: string
  alert_ids: string[]; evidence_count: number
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [c, setCase] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntity<Case[]>('cases.json')
      .then(cases => setCase(cases.find(x => x.case_id === id) || null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6 max-w-5xl"><SkeletonCard className="h-96" /></div>
  if (!c) return <div className="p-6 text-center text-muted-foreground"><Link to="/cases" className="text-primary hover:underline">← {t('threatActors.backToList')}</Link></div>

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <Link to="/cases" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3 h-3" /> Vakalara Dön
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-muted-foreground">{c.case_id}</span>
          <SeverityPill severity={c.severity as 'critical'|'high'|'medium'|'low'|'info'} />
          <StatusPill status={c.status} />
        </div>
        <h1 className="text-xl font-semibold">{c.title}</h1>
        <div className="flex items-center gap-3 text-2xs text-muted-foreground mt-1">
          <span>Sorumlu: {c.owner || 'Atanmamış'}</span>
          <span>Oluşturma: {new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
          <span>Güncelleme: {new Date(c.updated_at).toLocaleDateString('tr-TR')}</span>
        </div>
      </div>

      {/* Narrative */}
      <section className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Olay Açıklaması</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{c.narrative}</p>
      </section>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Etkilenen Kullanıcı', value: c.affected_users.length, icon: User },
          { label: 'Etkilenen Cihaz', value: c.affected_devices.length, icon: Monitor },
          { label: 'MITRE Tekniği', value: c.mitre_techniques.length, icon: Target },
          { label: 'Kanıt', value: c.evidence_count, icon: FileText },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-lg border border-border bg-card">
            <s.icon className="w-3.5 h-3.5 text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-2xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Affected entities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section>
          <h2 className="text-sm font-semibold mb-2">Etkilenen Kullanıcılar</h2>
          <div className="space-y-1">
            {c.affected_users.map(u => (
              <div key={u} className="px-3 py-1.5 rounded border border-border bg-card text-xs font-mono">{u}</div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold mb-2">Etkilenen Cihazlar</h2>
          <div className="space-y-1">
            {c.affected_devices.map(d => (
              <div key={d} className="px-3 py-1.5 rounded border border-border bg-card text-xs font-mono">{d}</div>
            ))}
          </div>
        </section>
      </div>

      {/* MITRE techniques */}
      <section>
        <h2 className="text-sm font-semibold mb-2">MITRE ATT&CK Teknikleri</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {c.mitre_techniques.map(t => (
            <Link key={t} to={`/mitre`} className="px-2 py-1 rounded bg-muted font-mono text-2xs hover:bg-primary/10 transition-colors">
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* Linked alerts */}
      <section>
        <h2 className="text-sm font-semibold mb-2">Bağlantılı Uyarılar ({c.alert_ids.length})</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {c.alert_ids.map(aid => (
            <Link key={aid} to={`/alerts/${aid}`} className="px-2 py-1 rounded border border-border bg-card font-mono text-2xs hover:border-primary/20 hover:text-primary transition-colors">
              {aid}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
