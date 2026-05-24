import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

const Overview = lazy(() => import('@/pages/Overview'))
const Alerts = lazy(() => import('@/pages/Alerts'))
const AlertDetail = lazy(() => import('@/pages/AlertDetail'))
const Incidents = lazy(() => import('@/pages/Incidents'))
const IncidentDetail = lazy(() => import('@/pages/IncidentDetail'))
const IOCs = lazy(() => import('@/pages/IOCs'))
const Playbooks = lazy(() => import('@/pages/Playbooks'))
const PlaybookDetail = lazy(() => import('@/pages/PlaybookDetail'))
const Endpoints = lazy(() => import('@/pages/Endpoints'))
const EndpointDetail = lazy(() => import('@/pages/EndpointDetail'))
const Mitre = lazy(() => import('@/pages/Mitre'))
const Detections = lazy(() => import('@/pages/Detections'))
const Settings = lazy(() => import('@/pages/Settings'))

function PageFallback() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="status" aria-label="Sayfa yükleniyor" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

function App() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <ErrorBoundary>
      {/* Skip to main content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:outline-none">
        Ana içeriğe atla
      </a>

      <div className="min-h-screen bg-background">
        <Sidebar />
        <header role="banner">
          <Topbar />
        </header>
        <main
          id="main-content"
          className={cn(
            'min-h-screen transition-all duration-200',
            collapsed ? 'ml-14' : 'ml-56'
          )}
        >
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/alerts/:id" element={<AlertDetail />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/incidents/:id" element={<IncidentDetail />} />
              <Route path="/iocs" element={<IOCs />} />
              <Route path="/playbooks" element={<Playbooks />} />
              <Route path="/playbooks/:id" element={<PlaybookDetail />} />
              <Route path="/endpoints" element={<Endpoints />} />
              <Route path="/endpoints/:id" element={<EndpointDetail />} />
              <Route path="/mitre" element={<Mitre />} />
              <Route path="/detections" element={<Detections />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
          <footer className="border-t border-border py-3 px-6 text-[10px] text-muted-foreground" role="contentinfo">
            SOC Console — Anadolu Finans Holding (kurgusal) • Tüm veriler simüle edilmiştir • Gerçek dünyayla bağlantısı yoktur
          </footer>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App
