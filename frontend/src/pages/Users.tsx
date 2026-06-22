import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserStore } from '@/store'
import { useTranslation } from '@/i18n'
import { SkeletonTable } from '@/components/ui/skeleton-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Users, ShieldAlert, ShieldCheck } from 'lucide-react'

export default function UsersPage() {
  const { t } = useTranslation()
  const { data: users, isLoading, load } = useUserStore()
  const [deptFilter, setDeptFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  useEffect(() => { load() }, [load])

  const departments = useMemo(() => [...new Set(users.map(u => u.department).filter(Boolean))], [users])

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (deptFilter !== 'all' && u.department !== deptFilter) return false
      if (riskFilter === 'critical' && u.risk_score < 70) return false
      if (riskFilter === 'high' && (u.risk_score < 50 || u.risk_score >= 70)) return false
      if (riskFilter === 'medium' && (u.risk_score < 30 || u.risk_score >= 50)) return false
      if (riskFilter === 'low' && u.risk_score >= 30) return false
      return true
    }).sort((a, b) => b.risk_score - a.risk_score)
  }, [users, deptFilter, riskFilter])

  if (isLoading) return <div className="p-6"><SkeletonTable rows={14} /></div>

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold">Kullanıcı Risk Dashboard</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {users.length} kullanıcı · {departments.length} departman
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="h-7 px-2 rounded-md border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">{t('common.all')} Departmanlar</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <div className="flex items-center gap-1">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setRiskFilter(tier)}
              className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                riskFilter === tier ? 'bg-primary/10 border-primary/30 text-primary font-medium' : 'border-border text-muted-foreground hover:bg-accent'
              }`}
              aria-pressed={riskFilter === tier}
            >
              {tier === 'all' ? t('common.all') : tier === 'critical' ? 'Kritik' : tier === 'high' ? 'Yüksek' : tier === 'medium' ? 'Orta' : 'Düşük'}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground ml-auto">
          {users.filter(u => u.risk_score >= 70).length} kritik · {filtered.length} kullanıcı
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="w-8 h-8" />} title={t('common.noResults')} />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Kullanıcı</th>
                <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Departman</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Rol</th>
                <th className="text-left px-3 py-2 font-medium">Risk</th>
                <th className="text-left px-3 py-2 font-medium">Faktörler</th>
                <th className="text-right px-3 py-2 font-medium">Uyarı</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => {
                const riskIcon = user.risk_score >= 70 ? ShieldAlert : user.risk_score >= 40 ? ShieldCheck : ShieldCheck
                const Icon = riskIcon
                return (
                  <tr key={user.user_id} className="border-b border-border last:border-0 even:bg-muted/5 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3 h-3 shrink-0 ${user.risk_score >= 70 ? 'text-severity-critical' : user.risk_score >= 40 ? 'text-severity-medium' : 'text-severity-low'}`} />
                        <div>
                          <Link to={`/users/${user.user_id}`} className="font-medium text-xs hover:text-primary transition-colors">{user.display_name}</Link>
                          <div className="text-xs text-muted-foreground font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell text-xs">{user.department || '—'}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden md:table-cell text-xs capitalize">{user.role}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${user.risk_score >= 70 ? 'bg-severity-critical' : user.risk_score >= 50 ? 'bg-severity-high' : user.risk_score >= 30 ? 'bg-severity-medium' : 'bg-severity-low'}`}
                            style={{ width: `${Math.min(user.risk_score, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">{user.risk_score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {user.risk_factors.slice(0, 3).map(f => (
                          <span key={f.rule} className="px-1.5 py-0.5 rounded text-2xs bg-muted text-muted-foreground" title={`${f.rule}: ${f.points}p`}>
                            {f.rule.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {user.risk_factors.length > 3 && <span className="text-2xs text-muted-foreground">+{user.risk_factors.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs">
                      <Link to={`/alerts?user=${user.user_id}`} className="text-primary hover:underline">
                        {user.alert_count > 0 ? user.alert_count : '—'}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
