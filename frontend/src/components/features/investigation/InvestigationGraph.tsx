import { useMemo, useCallback } from 'react'
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, type Node, type Edge } from 'reactflow'
import 'reactflow/dist/style.css'
import { useNavigate } from 'react-router-dom'
import { useAlertStore, useIOCStore, useAssetStore, useUserStore } from '@/store'
import { EmptyState } from '@/components/ui/empty-state'
import { Share2 } from 'lucide-react'
import type { Incident } from '@/types'

interface Props { incident: Incident }

export default function InvestigationGraph({ incident }: Props) {
  const navigate = useNavigate()
  const { data: alerts } = useAlertStore()
  const { data: iocs } = useIOCStore()
  const { data: assets } = useAssetStore()
  const { data: users } = useUserStore()

  const incAlerts = alerts.filter((a) => incident.alert_ids.includes(a.alert_id))

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    let x = 0; let y = 0
    const col = 250; const row = 120

    // Incident node (center top)
    const incId = `inc-${incident.incident_id}`
    nodes.push({ id: incId, type: 'default', position: { x: 200, y: 0 }, data: { label: incident.incident_id, kind: 'mitre' }, style: { background: 'hsl(var(--primary) / 0.15)', border: '1px solid hsl(var(--primary) / 0.4)', borderRadius: '8px', padding: '8px 14px', fontSize: 10, fontWeight: 600, color: 'hsl(var(--primary))' } })

    // Alert nodes
    incAlerts.forEach((a, i) => {
      const aid = `alert-${a.alert_id}`
      y = 100 + i * row
      nodes.push({ id: aid, position: { x, y }, data: { label: a.alert_id, kind: 'alert' }, style: nodeStyle('alert') })
      edges.push({ id: `${incId}-${aid}`, source: incId, target: aid, animated: false, style: { stroke: 'hsl(var(--muted-foreground) / 0.3)' } })

      // User node
      const uid = `user-${a.affected_user_id}`
      if (!nodes.find((n) => n.id === uid)) {
        const user = users.find((u) => u.user_id === a.affected_user_id)
        nodes.push({ id: uid, position: { x: x + col, y: y - 20 }, data: { label: user?.display_name ?? a.affected_user_id, kind: 'user' }, style: nodeStyle('user') })
      }
      edges.push({ id: `${aid}-${uid}`, source: aid, target: uid, style: { stroke: 'hsl(var(--muted-foreground) / 0.2)' } })

      // Asset node
      if (a.affected_asset_id) {
        const astId = `ast-${a.affected_asset_id}`
        if (!nodes.find((n) => n.id === astId)) {
          const ast = assets.find((as) => as.asset_id === a.affected_asset_id)
          nodes.push({ id: astId, position: { x: x + col, y: y + 20 }, data: { label: ast?.hostname ?? a.affected_asset_id, kind: 'asset' }, style: nodeStyle('asset') })
        }
        edges.push({ id: `${aid}-${astId}`, source: aid, target: astId, style: { stroke: 'hsl(var(--muted-foreground) / 0.2)' } })
      }

      // MITRE technique nodes
      a.mitre_technique_ids?.slice(0, 3).forEach((tid, ti) => {
        const mid = `mitre-${tid}`
        if (!nodes.find((n) => n.id === mid)) {
          nodes.push({ id: mid, position: { x: x - col, y: y + ti * 30 }, data: { label: tid, kind: 'mitre' }, style: nodeStyle('mitre') })
        }
        edges.push({ id: `${aid}-${mid}`, source: mid, target: aid, style: { stroke: 'hsl(var(--muted-foreground) / 0.25)', strokeDasharray: '4 2' } })
      })
    })

    // IOC nodes
    const relIOCs = iocs.filter((ioc) => incAlerts.some((a) => ioc.related_alert_ids.includes(a.alert_id)))
    relIOCs.forEach((ioc, i) => {
      const iid = `ioc-${ioc.ioc_id}`
      nodes.push({ id: iid, position: { x: x + col * 2, y: 100 + i * row }, data: { label: `${ioc.type.toUpperCase()}: ${ioc.value.slice(0, 18)}`, kind: 'ioc' }, style: nodeStyle('ioc') })
      ioc.related_alert_ids.forEach((aid) => {
        if (incAlerts.find((a) => a.alert_id === aid)) {
          edges.push({ id: `${iid}-alert-${aid}`, source: `alert-${aid}`, target: iid, style: { stroke: 'hsl(var(--muted-foreground) / 0.2)', strokeDasharray: '3 3' } })
        }
      })
    })

    return { initialNodes: nodes.slice(0, 50), initialEdges: edges.slice(0, 100) }
  }, [incAlerts, iocs, users, assets, incident, incAlerts])

  const [nodes] = useNodesState(initialNodes)
  const [edges] = useEdgesState(initialEdges)

  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    const d = node.data as Record<string, string> | undefined
    const kind = d?.kind as string
    const label = d?.label as string
    if (kind === 'alert') navigate(`/alerts/${label}`)
    else if (kind === 'ioc') navigate('/iocs')
    else if (kind === 'user') navigate(`/alerts?user=${label}`)
    else if (kind === 'asset') navigate(`/alerts?asset=${label}`)
  }, [navigate])

  if (initialNodes.length <= 1) {
    return <EmptyState icon={<Share2 className="w-6 h-6" />} title="Bu incident için entity ilişkileri henüz çıkarılamadı." />
  }

  return (
    <div>
      <div className="hidden sm:block rounded-lg border border-border overflow-hidden bg-muted/10" style={{ height: 480 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
          className="bg-card"
        >
          <Background color="hsl(var(--muted-foreground) / 0.1)" gap={20} />
          <Controls className="[&>button]:bg-card [&>button]:border-border [&>button]:text-foreground" />
          <MiniMap
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            maskColor="hsl(var(--background) / 0.7)"
            nodeColor={(n) => {
              const sevColors: Record<string, string> = { user: '#58a6ff', asset: '#06b6d4', alert: '#f85149', ioc: '#d29922', mitre: '#a855f7' }
              const kind = (n as unknown as { data?: { kind?: string } }).data?.kind
              return sevColors[kind ?? ''] ?? '#8b949e'
            }}
          />
        </ReactFlow>
      </div>
      <p className="sm:hidden text-xs text-muted-foreground text-center py-8">
        Investigation graph desktop'ta görüntülenebilir. Lütfen daha büyük bir ekranda açın.
      </p>
      <p className="text-[9px] text-muted-foreground/50 mt-1.5 hidden sm:block">Tıklanabilir node'lar. Zoom: fare tekerleği, Pan: sürükle.</p>
    </div>
  )
}

function nodeStyle(_kind: string): React.CSSProperties {
  return {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: 9,
    fontFamily: 'JetBrains Mono, monospace',
    color: 'hsl(var(--foreground))',
    maxWidth: 160,
  }
}
