import { useEffect, useState, Suspense, lazy } from 'react'
import { useKPIStore, useIncidentStore, useAlertStore, useMitreStore } from '@/store'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { SkeletonChart } from '@/components/ui/skeleton-card'
import { KpiCards } from '@/components/features/dashboard/KpiCards'
import { AlertVolumeChart } from '@/components/features/dashboard/AlertVolumeChart'
import { SeverityDonut } from '@/components/features/dashboard/SeverityDonut'
import { TopMitreBar } from '@/components/features/dashboard/TopMitreBar'
import { RecentIncidents } from '@/components/features/dashboard/RecentIncidents'
const GeoMap = lazy(() => import('@/components/features/dashboard/GeoMap').then(m => ({ default: m.GeoMap })))
import { loadEntity } from '@/lib/data'
import { toast } from 'sonner'

export default function Overview() {
  const { data: kpi, isLoading: kpiLoading, load: loadKPI } = useKPIStore()
  const { data: incidents, isLoading: incLoading, load: loadInc } = useIncidentStore()
  const { data: alerts, isLoading: alertLoading, load: loadAlerts } = useAlertStore()
  const { data: mitre, isLoading: mitreLoading, load: loadMitre } = useMitreStore()
  const [origins, setOrigins] = useState<Array<Record<string, unknown>>>([])
  const [geoLoading, setGeoLoading] = useState(false)

  useEffect(() => {
    loadKPI(); loadInc(); loadAlerts(); loadMitre()
    setGeoLoading(true)
    loadEntity<Array<Record<string, unknown>>>('threat_origins.json').then(setOrigins).catch((err) => { console.error('Tehdit kaynağı verisi yüklenemedi:', err); toast.error('Tehdit kaynağı verisi yüklenemedi.') }).finally(() => setGeoLoading(false))
  }, [loadKPI, loadInc, loadAlerts, loadMitre])

  const loading = kpiLoading || incLoading || alertLoading || mitreLoading

  if (loading && !kpi) {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <KpiCards kpi={kpi} isLoading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AlertVolumeChart alerts={alerts} isLoading={alertLoading} />
        </div>
        <SeverityDonut kpi={kpi} isLoading={kpiLoading} />
      </div>

      <Suspense fallback={<SkeletonChart height="h-80" />}>
        <GeoMap origins={origins as Array<{ country: string; city: string; lat: number; lng: number; count: number; severity: string }>} isLoading={geoLoading} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopMitreBar mitre={mitre} isLoading={mitreLoading} />
        </div>
        <div className="lg:col-span-2">
          <RecentIncidents incidents={incidents} isLoading={incLoading} />
        </div>
      </div>
    </div>
  )
}
