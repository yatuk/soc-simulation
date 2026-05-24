import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, AlertTriangle, FileSearch, Shield,
  Play, Monitor, Target, Crosshair, Settings, Users,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react'

const links = [
  { to: '/',           icon: LayoutDashboard, label: 'Genel Bakış' },
  { to: '/alerts',     icon: AlertTriangle,   label: 'Uyarılar' },
  { to: '/incidents',  icon: FileSearch,       label: 'Olaylar' },
  { to: '/iocs',       icon: Shield,           label: 'IOC\'ler' },
  { to: '/playbooks',  icon: Play,             label: 'Playbook\'lar' },
  { to: '/endpoints',  icon: Monitor,          label: 'Cihazlar' },
  { to: '/mitre',      icon: Target,           label: 'MITRE ATT&CK' },
  { to: '/threat-actors', icon: Users,         label: 'Tehdit Aktörleri' },
  { to: '/detections', icon: Crosshair,        label: 'Kurallar' },
  { to: '/settings',   icon: Settings,         label: 'Ayarlar' },
]

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggle = useUIStore((s) => s.toggleSidebar)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !collapsed) toggle()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [collapsed, toggle])

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggle}
          onKeyDown={(e) => e.key === 'Escape' && toggle()}
          role="button"
          tabIndex={0}
          aria-label="Menüyü kapat"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border flex flex-col transition-transform duration-200',
          // Mobile: slide from left
          'lg:translate-x-0',
          collapsed ? '-translate-x-full lg:w-14 lg:translate-x-0' : 'translate-x-0 w-56'
        )}
        role="navigation"
        aria-label="Ana navigasyon"
        aria-expanded={!collapsed}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary shrink-0" aria-hidden="true" />
            {!collapsed && (
              <span className="font-semibold text-sm whitespace-nowrap">SOC Console</span>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={toggle}
            className="lg:hidden p-1 rounded hover:bg-accent transition-colors"
            aria-label="Menüyü kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024 && !collapsed) toggle()
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center h-9 mx-2 px-2 rounded-md text-sm transition-colors',
                  collapsed && 'lg:justify-center',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
              aria-label={label}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="ml-2 truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggle}
          className="hidden lg:flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  )
}
