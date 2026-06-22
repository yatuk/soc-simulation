import { useEffect, useMemo, useState } from 'react'
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, type Node, type Edge } from 'reactflow'
import 'reactflow/dist/style.css'
import { loadEntity } from '@/lib/data'
import { SkeletonChart } from '@/components/ui/skeleton-card'

interface CorrEdge {
  source: string
  target: string
  type: string
  weight: number
}

const NODE_COLORS: Record<string, string> = {
  user: '#58a6ff',
  device: '#3fb950',
  ip: '#f0883e',
}

const NODE_ICONS: Record<string, string> = {
  user: '👤',
  device: '🖥️',
  ip: '🌐',
}

export default function Correlations() {
  const [edges, setEdges] = useState<CorrEdge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntity<{ edges: CorrEdge[] }>('correlations.json')
      .then(data => setEdges(data.edges ?? []))
      .catch(() => setEdges([]))
      .finally(() => setLoading(false))
  }, [])

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodeSet = new Set<string>()
    edges.forEach(e => { nodeSet.add(e.source); nodeSet.add(e.target) })

    const nodes: Node[] = Array.from(nodeSet).map((id, i) => {
      const kind = id.startsWith('USR') ? 'user' : id.startsWith('DEV') || id.startsWith('AST') ? 'device' : 'ip'
      return {
        id,
        position: { x: (i % 6) * 200 + 50, y: Math.floor(i / 6) * 120 + 50 },
        data: { label: id.slice(0, 24), kind },
        style: {
          background: `${NODE_COLORS[kind]}15`,
          border: `1px solid ${NODE_COLORS[kind]}`,
          color: NODE_COLORS[kind],
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
        },
      }
    })

    const rfEdges: Edge[] = edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      label: e.type,
      style: { stroke: NODE_COLORS[e.type] || '#8b949e', strokeWidth: Math.max(1, e.weight * 2) },
      labelStyle: { fontSize: '8px', fill: '#8b949e' },
    }))

    return { initialNodes: nodes.slice(0, 100), initialEdges: rfEdges.slice(0, 200) }
  }, [edges])

  const [nodes] = useNodesState(initialNodes)
  const [rfEdges] = useEdgesState(initialEdges)

  if (loading) return <div className="p-6"><SkeletonChart height="h-[70vh]" /></div>

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold">İlişki Grafiği</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{nodes.length} düğüm · {rfEdges.length} bağlantı</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-2xs text-muted-foreground">
        {Object.entries(NODE_COLORS).map(([kind, color]) => (
          <span key={kind} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {NODE_ICONS[kind]} {kind}
          </span>
        ))}
      </div>

      <div className="rounded-lg border border-border overflow-hidden h-[70vh]">
        <ReactFlow nodes={nodes} edges={rfEdges} fitView attributionPosition="bottom-left">
          <Background color="hsl(var(--muted-foreground) / 0.1)" gap={20} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
