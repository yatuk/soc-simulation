import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, AlertTriangle, FileSearch, Shield,
  Play, Monitor, Target, Crosshair, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

const links = [
  { to: '/',           icon: LayoutDashboard, label: 'Genel Bakış' },
  { to: '/alerts',     icon: AlertTriangle,   label: 'Uyarılar' },
  { to: '/incidents',  icon: FileSearch,       label: 'Olaylar' },
  { to: '/iocs',       icon: Shield,           label: 'IOC\'ler' },
  { to: '/playbooks',  icon: Play,             label: 'Playbook\'lar' },
  { to: '/endpoints',  icon: Monitor,          label: 'Cihazlar' },
  { to: '/mitre',      icon: Target,           label: 'MITRE ATT&CK' },
  { to: '/detections', icon: Crosshair,        label: 'Kurallar' },
  { to: '/settings',   icon: Settings,         label: 'Ayarlar' },
]

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggle = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border flex flex-col transition-all duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      <div className="flex items-center h-14 px-3 border-b border-border shrink-0">
        <Shield className="w-6 h-6 text-primary shrink-0" aria-hidden="true" />
        {!collapsed && (
          <span className="ml-2 font-semibold text-sm whitespace-nowrap">SOC Console</span>
        )}
      </div>

      <nav className="flex-1 py-2 overflow-y-auto" role="navigation" aria-label="Ana navigasyon">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center h-9 mx-2 px-2 rounded-md text-sm transition-colors',
                collapsed && 'justify-center',
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

      <button
        onClick={toggle}
        className="flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  )
}
