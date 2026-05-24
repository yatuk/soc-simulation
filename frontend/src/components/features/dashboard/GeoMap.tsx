import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe } from 'lucide-react'

interface ThreatOrigin {
  country: string; city: string; lat: number; lng: number
  count: number; severity: string
}

const SEVERITY_FILL: Record<string, string> = {
  critical: '#f85149',
  high: '#f0883e',
  medium: '#d29922',
  low: '#3fb950',
}

function latLngToXY(lat: number, lng: number, w: number, h: number): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * w,
    y: ((90 - lat) / 180) * h,
  }
}

interface Props {
  origins: ThreatOrigin[]
  isLoading: boolean
}

export function GeoMap({ origins, isLoading }: Props) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<number | null>(null)
  const W = 640; const H = 360

  if (isLoading) {
    return <div className="rounded-lg border border-border bg-card p-4 h-80 animate-pulse"><div className="h-4 w-32 bg-muted rounded mb-4" /><div className="h-64 bg-muted rounded" /></div>
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
        <Globe className="w-3.5 h-3.5" /> Tehdit Origin Haritası
      </h3>

      <div className="relative bg-[#0d1525] rounded-lg border border-border overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {/* Simplified world map SVG — continent silhouettes */}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full opacity-60" aria-label="Dünya haritası — tehdit origin'leri">
          {/* North America */}
          <path d="M80,40 L180,30 L200,50 L220,40 L240,60 L210,110 L150,130 L100,120 L60,110 L50,80 Z" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          {/* South America */}
          <path d="M150,140 L170,135 L185,150 L175,180 L160,220 L145,240 L135,200 L130,160 Z" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          {/* Europe */}
          <path d="M280,50 L320,40 L340,50 L350,45 L360,55 L355,65 L340,70 L320,75 L300,80 L285,70 Z" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          {/* Africa */}
          <path d="M300,85 L330,80 L350,85 L360,100 L355,140 L340,170 L320,180 L300,160 L290,130 Z" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          {/* Asia */}
          <path d="M360,50 L440,30 L500,35 L540,45 L560,60 L550,80 L520,85 L480,90 L440,80 L400,75 L370,60 Z" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
          {/* Australia */}
          <path d="M480,180 L510,175 L525,190 L515,210 L490,215 Z" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" />
        </svg>

        {/* Markers */}
        {origins.map((o, i) => {
          const { x, y } = latLngToXY(o.lat, o.lng, W, H)
          const r = Math.max(4, Math.min(14, o.count * 1.2))
          const isHovered = hovered === i
          return (
            <button
              key={o.country}
              onClick={() => navigate(`/alerts?q=${encodeURIComponent(o.country)}`)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="absolute group"
              style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, transform: 'translate(-50%, -50%)' }}
              aria-label={`${o.country}: ${o.count} tehdit, ${o.severity}`}
            >
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{
                width: r * 2.5, height: r * 2.5, left: -(r * 1.25), top: -(r * 1.25),
                backgroundColor: SEVERITY_FILL[o.severity] ?? '#8b949e',
              }} />
              {/* Dot */}
              <span className="block rounded-full border-2 border-background" style={{
                width: r, height: r,
                backgroundColor: SEVERITY_FILL[o.severity] ?? '#8b949e',
              }} />

              {/* Tooltip */}
              {isHovered && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-popover border border-border text-[10px] whitespace-nowrap shadow-lg z-10 pointer-events-none">
                  <span className="font-medium">{o.city}, {o.country}</span>
                  <span className="text-muted-foreground ml-1">{o.count} tehdit</span>
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
        <span>{origins.length} ülke, {origins.reduce((s, o) => s + o.count, 0)} IOC</span>
        <span className="italic">Türkiye marker'ı: Yerel tehdit. Daha sinsi, daha az egzotik.</span>
      </div>
    </div>
  )
}
