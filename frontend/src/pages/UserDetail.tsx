import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useUserStore, useAlertStore, useAssetStore } from '@/store'
import { useTranslation } from '@/i18n'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { ShieldAlert, ShieldCheck, ArrowLeft, Monitor, AlertTriangle } from 'lucide-react'
import type { User } from '@/types'

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data: users, load: loadUsers } = useUserStore()
  const { data: alerts, load: loadAlerts } = useAlertStore()
  const { data: assets, load: loadAssets } = useAssetStore()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadUsers(), loadAlerts(), loadAssets()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (users.length > 0) {
      setUser(users.find(u => u.user_id === id) || null)
    }
  }, [users, id])

  if (loading) return <div className="p-6 max-w-5xl"><SkeletonCard className="h-64" /></div>
  if (!user) return <div className="p-6 text-center text-muted-foreground"><Link to="/users" className="text-primary hover:underline">← {t('threatActors.backToList')}</Link></div>

  const userAlerts = alerts.filter(a => a.affected_user_id === user.user_id).slice(0, 10)
  const userAssets = assets.filter(a => user.asset_ids?.includes(a.asset_id))
  const RiskIcon = user.risk_score >= 70 ? ShieldAlert : ShieldCheck

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <Link to="/users" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3 h-3" /> {t('threatActors.backToList')}
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted-foreground">{user.user_id}</span>
            <span className="px-1.5 py-0.5 rounded text-2xs bg-muted text-muted-foreground capitalize">{user.role}</span>
          </div>
          <h1 className="text-xl font-semibold">{user.display_name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email} · {user.department || '—'} · {user.title || '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <RiskIcon className={`w-5 h-5 ${user.risk_score >= 70 ? 'text-severity-critical' : user.risk_score >= 40 ? 'text-severity-medium' : 'text-severity-low'}`} />
          <div>
            <div className="text-2xl font-bold">{user.risk_score}</div>
            <div className="text-2xs text-muted-foreground">Risk Skoru</div>
          </div>
        </div>
      </div>

      {/* Risk factors */}
      {user.risk_factors.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2">Risk Faktörleri</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {user.risk_factors.map(f => (
              <span key={f.rule} className="px-2 py-1 rounded-lg border border-border bg-card text-xs">
                <span className="font-medium">{f.rule.replace(/_/g, ' ')}</span>
                <span className="text-muted-foreground ml-1">+{f.points}p</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Uyarı', value: user.alert_count, icon: AlertTriangle },
          { label: 'Event', value: user.event_count, icon: AlertTriangle },
          { label: 'Asset', value: userAssets.length, icon: Monitor },
          { label: 'Risk Faktörü', value: user.risk_factors.length, icon: RiskIcon },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-lg border border-border bg-card">
            <s.icon className="w-3.5 h-3.5 text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-2xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <section>
        <h2 className="text-sm font-semibold mb-2">Son Uyarılar ({userAlerts.length})</h2>
        {userAlerts.length === 0 ? (
          <p className="text-xs text-muted-foreground">Bu kullanıcıda uyarı yok.</p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Uyarı ID</th>
                  <th className="text-left px-3 py-2 font-medium">Ad</th>
                  <th className="text-left px-3 py-2 font-medium">Önem</th>
                  <th className="text-left px-3 py-2 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {userAlerts.map(a => (
                  <tr key={a.alert_id} className="border-b border-border last:border-0 even:bg-muted/5 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-3 py-2 font-mono text-2xs">
                      <Link to={`/alerts/${a.alert_id}`} className="text-primary hover:underline">{a.alert_id}</Link>
                    </td>
                    <td className="px-3 py-2">{a.title}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-2xs ${
                        a.severity === 'critical' ? 'bg-severity-critical/15 text-severity-critical' :
                        a.severity === 'high' ? 'bg-severity-high/15 text-severity-high' :
                        a.severity === 'medium' ? 'bg-severity-medium/15 text-severity-medium' :
                        'bg-severity-low/15 text-severity-low'
                      }`}>{a.severity}</span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(a.detected_at).toLocaleDateString('tr-TR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Assets */}
      {userAssets.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2">Cihazlar ({userAssets.length})</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {userAssets.map(ast => (
              <Link key={ast.asset_id} to={`/endpoints/${ast.asset_id}`} className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs hover:border-primary/20 transition-colors">
                <Monitor className="w-3 h-3 inline mr-1 text-muted-foreground" />
                {ast.hostname}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
