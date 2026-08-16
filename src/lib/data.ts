import { demoMode, supabase } from './supabase'
import { demoActions, demoAlerts, demoCosts, demoKpis, demoOpportunities, demoRevenue, demoScenarios, demoSources, demoTeams } from './demo'
import type { ActionItem, AlertItem, CostItem, DataSource, KPISet, Opportunity, RevenuePoint, Scenario, TeamPerformance } from './types'

async function orgId() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  if (error) throw error
  return data.organization_id as string
}

export async function getDashboard(): Promise<{ kpis: KPISet; revenue: RevenuePoint[]; teams: TeamPerformance[]; alerts: AlertItem[] }> {
  if (demoMode || !supabase) return { kpis: demoKpis, revenue: demoRevenue, teams: demoTeams, alerts: demoAlerts }
  const oid = await orgId(); if (!oid) throw new Error('Organização não encontrada')
  const [{ data: metrics }, { data: trend }, { data: teamRows }, { data: alertRows }] = await Promise.all([
    supabase.rpc('executive_kpis', { p_organization_id: oid }),
    supabase.rpc('revenue_trend', { p_organization_id: oid, p_months: 6 }),
    supabase.rpc('team_performance', { p_organization_id: oid }),
    supabase.from('alerts').select('*').eq('organization_id', oid).order('created_at', { ascending: false }).limit(8),
  ])
  const m = (metrics as any)?.[0] ?? {}
  return {
    kpis: {
      revenueRealized: Number(m.revenue_realized ?? 0), revenueForecast: Number(m.revenue_forecast ?? 0), pipelineValue: Number(m.pipeline_value ?? 0),
      conversionRate: Number(m.conversion_rate ?? 0), targetRevenue: Number(m.target_revenue ?? 0), operationalCost: Number(m.operational_cost ?? 0),
      roi: Number(m.roi ?? 0), productivity: Number(m.productivity ?? 0), activeAgents: Number(m.active_agents ?? 0), avgAgingDays: Number(m.avg_aging_days ?? 0),
    },
    revenue: (trend ?? []).map((r:any)=>({period:r.period, realized:Number(r.realized), forecast:Number(r.forecast), target:Number(r.target)})),
    teams: (teamRows ?? []).map((r:any)=>({id:r.id, team:r.team, conversion:Number(r.conversion), revenue:Number(r.revenue), pipeline:Number(r.pipeline), activities:Number(r.activities), capacity:Number(r.capacity)})),
    alerts: (alertRows ?? []).map(mapAlert),
  }
}

const mapAlert = (r:any): AlertItem => ({ id:r.id, severity:r.severity, category:r.category, title:r.title, problem:r.problem, evidence:r.evidence ?? '', probableCause:r.probable_cause ?? '', impact:r.impact ?? '', recommendedAction:r.recommended_action ?? '', confidence:Number(r.confidence ?? 0), status:r.status, createdAt:r.created_at })

export async function getAlerts(): Promise<AlertItem[]> {
  if (demoMode || !supabase) return demoAlerts
  const oid = await orgId(); const { data, error } = await supabase.from('alerts').select('*').eq('organization_id', oid).order('created_at',{ascending:false}); if(error) throw error
  return (data ?? []).map(mapAlert)
}
export async function runIntelligence() {
  if (demoMode || !supabase) return { generated: demoAlerts.length }
  const oid=await orgId(); const { data, error }=await supabase.rpc('run_intelligence_rules',{p_organization_id:oid}); if(error) throw error; return data
}
export async function updateAlertStatus(id:string, status:AlertItem['status']) {
  if (demoMode || !supabase) return
  const { error }=await supabase.from('alerts').update({status, resolved_at: status==='resolved'?new Date().toISOString():null}).eq('id',id); if(error) throw error
}
export async function getActions(): Promise<ActionItem[]> {
  if (demoMode || !supabase) return demoActions
  const oid=await orgId(); const {data,error}=await supabase.from('action_plans').select('*').eq('organization_id',oid).order('due_date'); if(error) throw error
  return (data??[]).map((r:any)=>({id:r.id,title:r.title,owner:r.owner_name??'—',dueDate:r.due_date??'',status:r.status,baseline:Number(r.baseline_value??0),result:Number(r.result_value??0)}))
}
export async function createAction(input:{title:string;owner:string;dueDate:string}) {
  if (demoMode || !supabase) return { id: crypto.randomUUID(), ...input, status:'todo' as const }
  const oid=await orgId(); const {data,error}=await supabase.from('action_plans').insert({organization_id:oid,title:input.title,owner_name:input.owner,due_date:input.dueDate}).select().single(); if(error) throw error; return data
}
export async function getOpportunities(): Promise<Opportunity[]> {
  if (demoMode || !supabase) return demoOpportunities
  const oid=await orgId(); const {data,error}=await supabase.from('opportunity_detail').select('*').eq('organization_id',oid); if(error) throw error
  return (data??[]).map((r:any)=>({id:r.id,company:r.company??r.external_id??'Oportunidade',owner:r.owner??'—',team:r.team??'—',source:r.source??'—',stage:r.stage,value:Number(r.value),probability:Number(r.probability),agingDays:Number(r.aging_days),status:r.status}))
}
export async function getCosts(): Promise<CostItem[]> {
  if (demoMode || !supabase) return demoCosts
  const oid=await orgId(); const {data,error}=await supabase.from('costs').select('*').eq('organization_id',oid).order('period_start',{ascending:false}); if(error) throw error
  return (data??[]).map((r:any)=>({id:r.id,category:r.category,amount:Number(r.amount),type:(r.cost_type??'variable'),period:`${r.period_start} — ${r.period_end}`}))
}
export async function getSources(): Promise<DataSource[]> {
  if (demoMode || !supabase) return demoSources
  const oid=await orgId(); const {data,error}=await supabase.from('data_sources').select('*').eq('organization_id',oid).order('name'); if(error) throw error
  return (data??[]).map((r:any)=>({id:r.id,name:r.name,type:r.type,status:r.status,lastSync:r.last_sync_at?new Date(r.last_sync_at).toLocaleString('pt-BR'):'Nunca',records:Number(r.records_count??0)}))
}
export async function getScenarios(): Promise<Scenario[]> {
  if (demoMode || !supabase) return demoScenarios
  const oid=await orgId(); const {data,error}=await supabase.from('scenarios').select('*').eq('organization_id',oid).order('created_at',{ascending:false}); if(error) throw error
  return (data??[]).map((r:any)=>({id:r.id,name:r.name,headcountDelta:Number(r.assumptions?.headcountDelta??0),capacityDelta:Number(r.projected_capacity_delta??0),whatsappShare:Number(r.assumptions?.whatsappShare??0),hoursDelta:Number(r.assumptions?.hoursDelta??0),projectedCost:Number(r.projected_cost??0),projectedRevenue:Number(r.projected_revenue??0),projectedRoi:Number(r.projected_roi??0)}))
}
export async function saveScenario(input:{name:string;headcountDelta:number;whatsappShare:number;hoursDelta:number}) {
  const base=demoKpis
  const projectedCost=Math.max(0, base.operationalCost + input.headcountDelta*11000 + Math.max(0,input.whatsappShare-28)*2500 + Math.max(0,input.hoursDelta)*18000)
  const capacityDelta=input.headcountDelta*1.5 + (input.whatsappShare-28)*.55 + input.hoursDelta*2.2
  const projectedRevenue=Math.max(0, base.revenueForecast*(1+capacityDelta/100*.72))
  const projectedRoi=projectedCost ? (projectedRevenue-projectedCost)/projectedCost : 0
  const scenario={id:crypto.randomUUID(),...input,capacityDelta,projectedCost,projectedRevenue,projectedRoi}
  if (!demoMode && supabase) { const oid=await orgId(); const {error}=await supabase.from('scenarios').insert({organization_id:oid,name:input.name,assumptions:input,projected_capacity_delta:capacityDelta,projected_cost:projectedCost,projected_revenue:projectedRevenue,projected_roi:projectedRoi}); if(error) throw error }
  return scenario
}

export async function importCsv(file: File) {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) throw new Error('CSV sem linhas de dados')
  const headers=lines[0].split(',').map(s=>s.trim().toLowerCase())
  const required=['external_id','stage','value']; const missing=required.filter(h=>!headers.includes(h)); if(missing.length) throw new Error(`Colunas obrigatórias: ${missing.join(', ')}`)
  const rows=lines.slice(1).map(line=>{const cells=line.split(','); const obj:Record<string,string>={}; headers.forEach((h,i)=>obj[h]=(cells[i]??'').trim()); return obj})
  const unique=new Map<string,Record<string,string>>(); rows.forEach(r=>{if(r.external_id) unique.set(r.external_id,r)})
  if (demoMode || !supabase) return { total: rows.length, imported: unique.size, duplicates: rows.length-unique.size }
  const oid=await orgId(); const {data:ops}=await supabase.from('operations').select('id').eq('organization_id',oid).limit(1); const operationId=ops?.[0]?.id ?? null
  const payload=[...unique.values()].map(r=>({organization_id:oid,operation_id:operationId,external_id:r.external_id,stage:r.stage,value:Number(r.value||0),probability:Number(r.probability||0),status:r.status||'open',company:r.company||null,source:r.source||null}))
  const {error}=await supabase.from('opportunities').upsert(payload,{onConflict:'organization_id,external_id',ignoreDuplicates:false}); if(error) throw error
  return { total: rows.length, imported: unique.size, duplicates: rows.length-unique.size }
}
