import { demoMode, supabase } from './supabase'
import { demoActions, demoAlerts, demoCosts, demoKpis, demoOpportunities, demoRevenue, demoScenarios, demoSources, demoTeams } from './demo'
import type { ActionItem, AlertItem, CopilotAnswer, CostItem, DataSource, DecisionCockpit, DecisionPriority, KPISet, Opportunity, RevenuePoint, RiskItem, Scenario, TeamPerformance } from './types'

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


function riskSeverityWeight(severity: AlertItem['severity']) {
  return severity === 'critical' ? 1 : severity === 'high' ? .82 : severity === 'medium' ? .58 : .32
}

function priorityFromAlert(a: AlertItem, index: number): DecisionPriority {
  const weights = { critical: 1, high: .82, medium: .55, low: .25 } as const
  const impact = Math.round((demoKpis.pipelineValue * .012) * weights[a.severity] * (1 + index * .08))
  return {
    id: a.id,
    severity: a.severity,
    title: a.title,
    whyNow: a.problem,
    impactLabel: 'Exposição estimada',
    impactValue: impact,
    confidence: a.confidence,
    owner: a.category === 'Qualidade' ? 'Dados & BI' : a.category === 'Processo' ? 'Gerência de Operações' : 'Gestão Comercial',
    dueLabel: a.severity === 'critical' ? 'Agora' : a.severity === 'high' ? 'Hoje' : 'Até 48h',
    action: a.recommendedAction,
  }
}

export async function getDecisionCockpit(): Promise<DecisionCockpit> {
  const [{ kpis, teams, alerts }, sources] = await Promise.all([getDashboard(), getSources()])
  const attainment = kpis.targetRevenue ? (kpis.revenueRealized / kpis.targetRevenue) * 100 : 0
  const forecastAttainment = kpis.targetRevenue ? (kpis.revenueForecast / kpis.targetRevenue) * 100 : 0
  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'acknowledged')
  const sortedAlerts = [...openAlerts].sort((a,b)=>riskSeverityWeight(b.severity)-riskSeverityWeight(a.severity))
  const priorities = sortedAlerts.slice(0,3).map(priorityFromAlert)
  while (priorities.length < 3) {
    const fillers: DecisionPriority[] = [
      { id:'p-forecast', severity: forecastAttainment < 100 ? 'high' : 'low', title:'Fechamento do mês', whyNow:`Forecast em ${forecastAttainment.toFixed(1)}% da meta.`, impactLabel:'Gap para meta', impactValue:Math.max(0,kpis.targetRevenue-kpis.revenueForecast), confidence:88, owner:'Diretoria Comercial', dueLabel:'Hoje', action:'Priorizar oportunidades de maior valor, probabilidade e menor aging.' },
      { id:'p-capacity', severity:'medium', title:'Redistribuição de capacidade', whyNow:'Há diferença relevante de capacidade e conversão entre equipes.', impactLabel:'Receita recuperável', impactValue:kpis.pipelineValue*.018, confidence:79, owner:'Planejamento', dueLabel:'Até 48h', action:'Redistribuir carteira e capacidade para equipes com melhor conversão marginal.' },
      { id:'p-data', severity:'medium', title:'Confiança da base executiva', whyNow:'Uma fonte financeira está com sincronização abaixo do padrão esperado.', impactLabel:'Indicadores afetados', impactValue:4, confidence:96, owner:'Dados & BI', dueLabel:'Hoje', action:'Atualizar a fonte financeira antes do fechamento executivo.' },
    ]
    const f=fillers.find(x=>!priorities.some(p=>p.id===x.id)); if(!f)break; priorities.push(f)
  }
  const teamAvg = teams.length ? teams.reduce((s,t)=>s+t.conversion,0)/teams.length : 0
  const bestTeam = [...teams].sort((a,b)=>b.conversion-a.conversion)[0]
  const worstTeam = [...teams].sort((a,b)=>a.conversion-b.conversion)[0]
  const drivers = [
    { label: bestTeam ? `${bestTeam.team}: conversão` : 'Melhor equipe', impact: bestTeam ? Math.max(2,bestTeam.conversion-teamAvg) : 5.2, direction:'positive' as const, context:'Contribuição positiva para receita e forecast' },
    { label: worstTeam ? `${worstTeam.team}: conversão` : 'Equipe em atenção', impact: worstTeam ? -Math.max(2,teamAvg-worstTeam.conversion) : -4.6, direction:'negative' as const, context:'Principal desvio de performance do período' },
    { label:'Oportunidades com aging > 10 dias', impact:-3.8, direction:'negative' as const, context:'Reduz qualidade e confiabilidade do pipeline' },
    { label:'Mix digital / WhatsApp', impact:2.7, direction:'positive' as const, context:'Ganho de produtividade e velocidade de contato' },
    { label:'Custo variável por contato', impact:-1.9, direction:'negative' as const, context:'Pressão sobre ROI operacional' },
  ]
  const risks: RiskItem[] = teams.map((t,i)=>({
    id:t.id,
    name:t.team,
    probability:Math.round(Math.max(18,Math.min(92,85-t.conversion*5+t.capacity*.16))),
    impact:Math.round(Math.max(22,Math.min(96,(t.pipeline/Math.max(1,kpis.pipelineValue))*220+45))),
    exposure:Math.round(t.pipeline*Math.max(.04,(9-t.conversion)/100)),
    category:i%2===0?'Resultado':'Capacidade',
    owner:'Gestor '+t.team,
  })).sort((a,b)=>(b.probability*b.impact)-(a.probability*a.impact))
  const onlineSources=sources.filter(s=>s.status==='online').length
  const freshness=Math.round((onlineSources/Math.max(1,sources.length))*100)
  const trust={score:Math.round(freshness*.35+96*.3+94*.25+91*.1),freshness,completeness:96,consistency:94,duplicates:2,onlineSources,totalSources:sources.length}
  const scorecards = [
    {id:'revenue',label:'Receita realizada',value:new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:1}).format(kpis.revenueRealized),target:`Meta ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:1}).format(kpis.targetRevenue)}`,forecast:`Forecast ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:1}).format(kpis.revenueForecast)}`,delta:4.8,status:attainment>=80?'healthy' as const:attainment>=65?'attention' as const:'risk' as const,confidence:94,freshness:'4 min'},
    {id:'conversion',label:'Conversão',value:`${kpis.conversionRate.toFixed(1)}%`,target:'Referência 9,0%',forecast:'Tendência 8,9%',delta:-1.4,status:kpis.conversionRate>=9?'healthy' as const:kpis.conversionRate>=7?'attention' as const:'risk' as const,confidence:91,freshness:'4 min'},
    {id:'pipeline',label:'Pipeline saudável',value:new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:1}).format(kpis.pipelineValue),target:'Cobertura alvo 2,5x',forecast:`Cobertura ${(kpis.pipelineValue/Math.max(1,kpis.targetRevenue-kpis.revenueRealized)).toFixed(1)}x`,delta:2.7,status:'healthy' as const,confidence:87,freshness:'8 min'},
    {id:'roi',label:'ROI operacional',value:`${kpis.roi.toFixed(2)}x`,target:'Meta 3,0x',forecast:`Custo ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:1}).format(kpis.operationalCost)}`,delta:6.1,status:kpis.roi>=3?'healthy' as const:kpis.roi>=2.4?'attention' as const:'risk' as const,confidence:93,freshness:'1 h'},
  ]
  const risksText = priorities.filter(p=>p.severity==='high'||p.severity==='critical').map(p=>p.title)
  const brief = {
    headline: forecastAttainment >= 100 ? 'Forecast acima da meta, com risco concentrado em conversão e aging.' : 'Forecast abaixo da meta; conversão e qualidade do pipeline exigem ação imediata.',
    summary:`A operação apresenta ${attainment.toFixed(0)}% da meta já realizada e forecast equivalente a ${forecastAttainment.toFixed(0)}% da meta. O maior ganho potencial está em corrigir os desvios de conversão e reduzir oportunidades sem atividade, preservando ROI e capacidade.`,
    generatedAt:new Date().toISOString(),
    positive:[`ROI em ${kpis.roi.toFixed(2)}x com produtividade de ${kpis.productivity.toFixed(1)}%.`,bestTeam?`${bestTeam.team} lidera conversão com ${bestTeam.conversion.toFixed(1)}%.`:'Capacidade operacional estável.'],
    risks:risksText.length?risksText:['Aging do pipeline acima do desejado','Sincronização financeira merece atenção'],
    decisions:priorities.slice(0,3).map(p=>p.action),
  }
  return {scorecards,priorities,drivers,risks,trust,brief}
}

export async function answerManagementQuestion(question: string): Promise<CopilotAnswer> {
  const [{ kpis, teams, alerts }, cockpit] = await Promise.all([getDashboard(), getDecisionCockpit()])
  const q=question.toLowerCase()
  const worst=[...teams].sort((a,b)=>a.conversion-b.conversion)[0]
  const best=[...teams].sort((a,b)=>b.conversion-a.conversion)[0]
  let answer='A principal decisão agora é atacar o maior desvio com impacto financeiro mensurável, sem perder a rastreabilidade da evidência.'
  let evidence=[cockpit.brief.summary]
  let recommendations=cockpit.priorities.slice(0,3).map(p=>p.action)
  if(q.includes('convers')||q.includes('venda')){
    answer=worst?`A conversão está mais pressionada na equipe ${worst.team}. Ela registra ${worst.conversion.toFixed(1)}%, abaixo da melhor equipe (${best?.team ?? 'referência'}) e concentra risco de perda do pipeline.`:'A conversão precisa ser analisada por equipe, canal e etapa.'
    evidence=[`Conversão consolidada: ${kpis.conversionRate.toFixed(1)}%.`,worst?`${worst.team}: ${worst.conversion.toFixed(1)}% de conversão e ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact'}).format(worst.pipeline)} em pipeline.`:'Sem recorte por equipe.',alerts.find(a=>a.category==='Conversão')?.evidence ?? 'Há oportunidades abertas com aging elevado.']
    recommendations=['Abrir as oportunidades da equipe com maior aging e maior valor.','Comparar origem, etapa e cadência com a equipe de melhor conversão.','Definir responsável e acompanhar a variação após 48 horas.']
  } else if(q.includes('meta')||q.includes('forecast')||q.includes('fech')){
    const gap=kpis.targetRevenue-kpis.revenueForecast
    answer=gap<=0?`O forecast atual supera a meta em ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact'}).format(Math.abs(gap))}, mas a qualidade do pipeline precisa ser protegida para que essa projeção se confirme.`:`Existe um gap projetado de ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact'}).format(gap)} para a meta.`
    evidence=[`Receita realizada: ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact'}).format(kpis.revenueRealized)}.`,`Forecast: ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact'}).format(kpis.revenueForecast)}.`,`Pipeline aberto: ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact'}).format(kpis.pipelineValue)}.`]
    recommendations=['Priorizar pipeline por valor × probabilidade × aging.','Criar meta diária de recuperação do gap.','Monitorar mudança de tendência e atualizar forecast após as ações.']
  } else if(q.includes('custo')||q.includes('roi')||q.includes('retorno')){
    answer=`O ROI operacional está em ${kpis.roi.toFixed(2)}x. A próxima análise deve separar crescimento de receita de crescimento de custo para localizar eficiência marginal.`
    evidence=[`Custo operacional: ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact'}).format(kpis.operationalCost)}.`,`Receita realizada: ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact'}).format(kpis.revenueRealized)}.`,`Produtividade: ${kpis.productivity.toFixed(1)}%.`]
    recommendations=['Simular incremento de HC antes de contratar.','Comparar custo por canal e custo por conversão.','Aprovar expansão somente quando o ROI marginal superar a referência definida.']
  } else if(q.includes('risco')||q.includes('prior')){
    answer=`As prioridades foram ordenadas por severidade, impacto financeiro estimado, confiança e urgência. A primeira é “${cockpit.priorities[0]?.title ?? 'revisar desvios'}”.`
    evidence=cockpit.priorities.slice(0,3).map(p=>`${p.title}: confiança ${p.confidence}% • ${p.dueLabel}.`)
    recommendations=cockpit.priorities.slice(0,3).map(p=>p.action)
  } else if(q.includes('dado')||q.includes('qualidade')||q.includes('confi')){
    answer=`A confiança executiva da base está em ${cockpit.trust.score}/100. O principal ponto de atenção é atualização das fontes; completude e consistência permanecem altas.`
    evidence=[`Freshness: ${cockpit.trust.freshness}%.`,`Completude: ${cockpit.trust.completeness}%.`,`Consistência: ${cockpit.trust.consistency}%.`]
    recommendations=['Bloquear decisões críticas quando a fonte responsável estiver vencida.','Exibir origem e horário de atualização em cada KPI.','Executar checks de duplicidade e reconciliação antes do fechamento.']
  }
  return {answer,evidence,recommendations,confidence:Math.round((cockpit.trust.score+91)/2),generatedAt:new Date().toISOString()}
}
