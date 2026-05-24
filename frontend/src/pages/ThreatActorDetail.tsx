import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { loadEntity } from '@/lib/data'
import { useIncidentStore } from '@/store'
import * as Icons from 'lucide-react'
import { ArrowLeft, Shield, Target, Wrench, Calendar, Info } from 'lucide-react'

interface ThreatActor {
  id: string; name: string; aliases: string[]; origin: { country: string; attribution_confidence: string; suspected_sponsor?: string }; motivation: string[]; active_since: string; status: string; targeted_sectors: string[]; targeted_geographies: string[]; associated_techniques: string[]; associated_tools: string[]; notable_campaigns: { name: string; year: number; description: string }[]; description: string; references: string[]; glyph: { color: string; icon: string }; matched_incidents: { incident_id: string; ttp_overlap_percent: number; rationale: string }[]
}

const MOTIVATION_LABELS: Record<string, string> = { espionage: 'Casusluk', financial: 'Finansal', destruction: 'Yıkım', hacktivism: 'Hacktivizm' }
const CONFIDENCE_LABELS: Record<string, string> = { high: 'Yüksek Güven', medium: 'Orta Güven', low: 'Düşük Güven' }

export default function ThreatActorDetail() {
  const { id } = useParams<{ id: string }>()
  const [actor, setActor] = useState<ThreatActor | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: incidents, load: loadInc } = useIncidentStore()
  const [tab, setTab] = useState<'overview'|'ttps'|'tools'|'campaigns'|'matches'>('overview')

  useEffect(() => {
    loadEntity<ThreatActor[]>('threat_actors.json').then(as => { setActor(as.find(a=>a.id===id)??null); setLoading(false) })
    if (incidents.length===0) loadInc()
  }, [id])

  if (loading) return <div className="p-6 max-w-5xl"><div className="h-64 bg-muted rounded-lg animate-pulse" /></div>
  if (!actor) return <div className="p-6 text-muted-foreground text-center">Aktör bulunamadı. <Link to="/threat-actors" className="text-primary hover:underline">Listeye dön</Link></div>

  const Icon = (Icons as unknown as Record<string, React.ComponentType<{className?:string}>>)[actor.glyph.icon] ?? Shield
  const matchedIncidents = incidents.filter(i => actor.matched_incidents.some(mi => mi.incident_id === i.incident_id))

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <Link to="/threat-actors" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-3 h-3"/> Aktörlere dön</Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{backgroundColor:`${actor.glyph.color}15`,color:actor.glyph.color}}><Icon className="w-7 h-7"/></div>
        <div>
          <h1 className="text-xl font-bold">{actor.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {actor.aliases.map(a=><span key={a} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{a}</span>)}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${actor.status==='active'?'bg-green-500/10 text-green-400':'bg-muted text-muted-foreground'}`}>{actor.status==='active'?'Aktif':actor.status}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span>{actor.origin.country} · {actor.origin.suspected_sponsor??'Belirsiz sponsor'} · {CONFIDENCE_LABELS[actor.origin.attribution_confidence]??actor.origin.attribution_confidence}</span>
        <span>{new Date().getFullYear() - parseInt(actor.active_since)} yıldır aktif</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 flex-wrap">
        {(['overview','ttps','tools','campaigns','matches'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab===t?'bg-primary/10 text-primary':'text-muted-foreground hover:bg-accent'}`}>
            {t==='overview'?'Genel Bakış':t==='ttps'?'TTPs':t==='tools'?'Araçlar':t==='campaigns'?'Kampanyalar':'Eşleşmeler'}
            {t==='matches' && actor.matched_incidents.length>0 && <span className="ml-1 text-[10px]">({actor.matched_incidents.length})</span>}
          </button>
        ))}
      </div>

      {tab==='overview' && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed whitespace-pre-line">{actor.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
            <InfoBlock label="Motivasyon" value={actor.motivation.map(m=>MOTIVATION_LABELS[m]??m).join(', ')}/>
            <InfoBlock label="Sektörler" value={actor.targeted_sectors.join(', ')}/>
            <InfoBlock label="Coğrafi Hedef" value={actor.targeted_geographies.join(', ')}/>
            <InfoBlock label="Aktif" value={`${actor.active_since}'ten beri`} />
          </div>
        </div>
      )}

      {tab==='ttps' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {actor.associated_techniques.map(tid=><Link key={tid} to={`/mitre`} className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors text-xs"><Target className="w-3.5 h-3.5 text-primary"/><span className="font-mono text-[10px]">{tid}</span></Link>)}
        </div>
      )}

      {tab==='tools' && (
        <div className="space-y-2">
          {actor.associated_tools.map(tool=><div key={tool} className="flex items-center gap-2 p-3 rounded-lg border border-border text-xs"><Wrench className="w-3.5 h-3.5 text-muted-foreground"/><span className="font-medium">{tool}</span></div>)}
        </div>
      )}

      {tab==='campaigns' && (
        <div className="space-y-4">
          {actor.notable_campaigns.map(c=><div key={c.name} className="p-4 rounded-lg border border-border"><div className="flex items-center gap-2 mb-2"><Calendar className="w-3.5 h-3.5 text-muted-foreground"/><span className="text-xs font-semibold">{c.name}</span><span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{c.year}</span></div><p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p></div>)}
        </div>
      )}

      {tab==='matches' && (
        <div className="space-y-4">
          <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Info className="w-3 h-3"/>Bu eşleşmeler <strong className="text-foreground">simüledir</strong> — gerçek attribution değildir.</p>
          {actor.matched_incidents.map(mi=>{
            const inc = matchedIncidents.find(i=>i.incident_id===mi.incident_id)
            return (
              <Link key={mi.incident_id} to={`/incidents/${mi.incident_id}`} className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{inc?.title??mi.incident_id}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{mi.incident_id}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-muted-foreground">TTP örtüşmesi:</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-48">
                    <div className="h-full bg-primary rounded-full" style={{width:`${mi.ttp_overlap_percent}%`}}/>
                  </div>
                  <span className="font-mono text-[10px] font-medium">%{mi.ttp_overlap_percent}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{mi.rationale}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InfoBlock({label,value}:{label:string;value:string}){return <div><div className="text-muted-foreground mb-0.5">{label}</div><div className="font-medium">{value}</div></div>}
