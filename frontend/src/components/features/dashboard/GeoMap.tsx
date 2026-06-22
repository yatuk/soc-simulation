import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps'
import { Globe } from 'lucide-react'
import { useTranslation } from '@/i18n'

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

// Istanbul as target center (Anadolu Finans HQ)
const TARGET: [number, number] = [29, 41]

const GEO_URL = `${import.meta.env.BASE_URL}countries-110m.json`

interface Props {
  origins: ThreatOrigin[]
  isLoading: boolean
}

export function GeoMap({ origins, isLoading }: Props) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [hovered, setHovered] = useState<string | null>(null)

  if (isLoading) {
    return <div className="rounded-lg border border-border bg-card p-4 h-80 animate-pulse"><div className="h-4 w-32 bg-muted rounded mb-4" /><div className="h-64 bg-muted rounded" /></div>
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-xs font-semibold mb-3 flex items-center gap-2">
        <Globe className="w-3.5 h-3.5" /> {t('dashboard.geoMap')}
      </h3>

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 155 }}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties?.name as string | undefined
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHovered(name ?? null)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      default: {
                        fill: 'hsl(var(--muted))',
                        stroke: 'hsl(var(--muted-foreground) / 0.3)',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill: 'hsl(var(--muted-foreground) / 0.2)',
                        stroke: 'hsl(var(--muted-foreground) / 0.6)',
                        strokeWidth: 0.5,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                    }}
                  />
                )
              })
            }
          </Geographies>

          {/* Attack flow lines from origins to target (Istanbul) */}
          {origins.map((o) => (
            <Line
              key={`line-${o.country}`}
              from={[o.lng, o.lat]}
              to={TARGET}
              stroke={SEVERITY_FILL[o.severity] ?? '#8b949e'}
              strokeWidth={Math.max(0.3, Math.min(1.5, o.count * 0.15))}
              strokeLinecap="round"
              strokeOpacity={0.3}
            />
          ))}

          {/* Target marker (Istanbul) */}
          <Marker coordinates={TARGET}>
            <circle r={5} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} opacity={0.9} />
          </Marker>

          {origins.map((o) => (
            <Marker key={o.country} coordinates={[o.lng, o.lat]}>
              <g
                onMouseEnter={() => setHovered(o.city)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/alerts?q=${encodeURIComponent(o.country)}`)}
                className="cursor-pointer"
              >
                {/* Pulse ring for critical */}
                {o.severity === 'critical' && (
                  <circle r={Math.min(6 + Math.sqrt(o.count) * 1.2, 16)} className="threat-pulse" fill={SEVERITY_FILL[o.severity]} opacity={0.25} />
                )}
                {/* Marker dot */}
                <circle r={Math.min(3 + Math.sqrt(o.count) * 0.7, 10)} fill={SEVERITY_FILL[o.severity]} opacity={0.9} />

                {/* Tooltip */}
                {hovered === o.city && (
                  <foreignObject x={10} y={-18} width={160} height={36} style={{ overflow: 'visible' }}>
                    <div className="bg-popover border border-border rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-lg pointer-events-none">
                      <span className="font-medium">{o.city}, {o.country}</span>
                      <span className="text-muted-foreground ml-1">{o.count} IOC</span>
                    </div>
                  </foreignObject>
                )}
              </g>
            </Marker>
          ))}
        </ComposableMap>
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>{origins.length} {t('iocs.source')?.toLowerCase?.() ?? 'kaynak'}, {origins.reduce((s, o) => s + o.count, 0)} IOC</span>
        {hovered && !origins.find(o => o.city === hovered) && <span>{hovered}</span>}
        <span>📍 Istanbul — Anadolu Finans HQ</span>
      </div>
    </div>
  )
}
