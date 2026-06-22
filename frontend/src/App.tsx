import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PageError } from '@/components/ui/page-error'
import { SkeletonCard } from '@/components/ui/skeleton-card'
import { useUIStore, useSettingsStore } from '@/store'
import { useTheme } from '@/hooks'
import { useTranslation } from '@/i18n'
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
const ThreatActors = lazy(() => import('@/pages/ThreatActors'))
const ThreatActorDetail = lazy(() => import('@/pages/ThreatActorDetail'))
const Users = lazy(() => import('@/pages/Users'))
const LogExplorer = lazy(() => import('@/pages/LogExplorer'))
const Cases = lazy(() => import('@/pages/Cases'))
const CaseDetail = lazy(() => import('@/pages/CaseDetail'))
const UserDetail = lazy(() => import('@/pages/UserDetail'))
const Correlations = lazy(() => import('@/pages/Correlations'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const CommandPalette = lazy(() => import('@/components/features/command-palette/CommandPalette').then(m => ({ default: m.CommandPalette })))

function PageFallback() {
  const { t } = useTranslation()
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="status" aria-label={t('app.pageLoading')} aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

function App() {
  useTheme()
  const { t } = useTranslation()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const cmdOpen = useUIStore((s) => s.cmdPaletteOpen)
  const toggleCmd = useUIStore((s) => s.toggleCmdPalette)
  const sidebarExpanded = useSettingsStore((s) => s.settings.sidebarExpanded)

  // Sync settings.sidebarExpanded ↔ ui.sidebarCollapsed
  useEffect(() => {
    const shouldCollapse = !sidebarExpanded
    if (shouldCollapse !== useUIStore.getState().sidebarCollapsed) {
      toggleSidebar()
    }
  }, [sidebarExpanded])

  return (
    <ErrorBoundary>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:outline-none">
        {t('app.skipToContent')}
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
              <Route path="/" element={<ErrorBoundary fallback={<PageError title="Overview" />}><Overview /></ErrorBoundary>} />
              <Route path="/alerts" element={<ErrorBoundary fallback={<PageError title="Alerts" />}><Alerts /></ErrorBoundary>} />
              <Route path="/alerts/:id" element={<ErrorBoundary fallback={<PageError />}><AlertDetail /></ErrorBoundary>} />
              <Route path="/incidents" element={<ErrorBoundary fallback={<PageError title="Incidents" />}><Incidents /></ErrorBoundary>} />
              <Route path="/incidents/:id" element={<ErrorBoundary fallback={<PageError />}><IncidentDetail /></ErrorBoundary>} />
              <Route path="/iocs" element={<ErrorBoundary fallback={<PageError title="IOCs" />}><IOCs /></ErrorBoundary>} />
              <Route path="/playbooks" element={<ErrorBoundary fallback={<PageError title="Playbooks" />}><Playbooks /></ErrorBoundary>} />
              <Route path="/playbooks/:id" element={<ErrorBoundary fallback={<PageError />}><PlaybookDetail /></ErrorBoundary>} />
              <Route path="/endpoints" element={<ErrorBoundary fallback={<PageError title="Endpoints" />}><Endpoints /></ErrorBoundary>} />
              <Route path="/endpoints/:id" element={<ErrorBoundary fallback={<PageError />}><EndpointDetail /></ErrorBoundary>} />
              <Route path="/mitre" element={<ErrorBoundary fallback={<PageError title="MITRE" />}><Mitre /></ErrorBoundary>} />
              <Route path="/detections" element={<ErrorBoundary fallback={<PageError title="Rules" />}><Detections /></ErrorBoundary>} />
              <Route path="/settings" element={<ErrorBoundary fallback={<PageError title="Settings" />}><Settings /></ErrorBoundary>} />
              <Route path="/threat-actors" element={<ErrorBoundary fallback={<PageError title="Threat Actors" />}><ThreatActors /></ErrorBoundary>} />
              <Route path="/threat-actors/:id" element={<ErrorBoundary fallback={<PageError />}><ThreatActorDetail /></ErrorBoundary>} />
              <Route path="/users" element={<ErrorBoundary fallback={<PageError title="Users" />}><Users /></ErrorBoundary>} />
              <Route path="/users/:id" element={<ErrorBoundary fallback={<PageError />}><UserDetail /></ErrorBoundary>} />
              <Route path="/logs" element={<ErrorBoundary fallback={<PageError title="Logs" />}><LogExplorer /></ErrorBoundary>} />
              <Route path="/cases" element={<ErrorBoundary fallback={<PageError title="Cases" />}><Cases /></ErrorBoundary>} />
              <Route path="/cases/:id" element={<ErrorBoundary fallback={<PageError />}><CaseDetail /></ErrorBoundary>} />
              <Route path="/correlations" element={<ErrorBoundary fallback={<PageError title="Correlations" />}><Correlations /></ErrorBoundary>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <footer className="border-t border-border py-3 px-6 text-xs text-muted-foreground" role="contentinfo">
            {t('app.footer')}
          </footer>
        </main>
      </div>
      <Suspense fallback={null}>
        {cmdOpen && <CommandPalette open={cmdOpen} onClose={toggleCmd} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
