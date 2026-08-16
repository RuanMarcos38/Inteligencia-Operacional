import type { ActionItem, AlertItem, CostItem, DataSource, KPISet, Opportunity, RevenuePoint, Scenario, TeamPerformance } from './types'

export const demoKpis: KPISet = {
  revenueRealized: 4200000,
  revenueForecast: 5100000,
  pipelineValue: 12400000,
  conversionRate: 8.7,
  targetRevenue: 4800000,
  operationalCost: 1180000,
  roi: 2.56,
  productivity: 82.4,
  activeAgents: 126,
  avgAgingDays: 12.8,
}
export const demoRevenue: RevenuePoint[] = [
  { period: 'Mar', realized: 3150000, forecast: 3300000, target: 3600000 },
  { period: 'Abr', realized: 3440000, forecast: 3600000, target: 3800000 },
  { period: 'Mai', realized: 3710000, forecast: 3920000, target: 4000000 },
  { period: 'Jun', realized: 3980000, forecast: 4250000, target: 4300000 },
  { period: 'Jul', realized: 4070000, forecast: 4580000, target: 4550000 },
  { period: 'Ago', realized: 4200000, forecast: 5100000, target: 4800000 },
]
export const demoTeams: TeamPerformance[] = [
  { id:'1', team:'Norte', conversion: 11.2, revenue: 1320000, pipeline: 3450000, activities: 812, capacity: 88 },
  { id:'2', team:'Centro', conversion: 9.1, revenue: 1180000, pipeline: 3220000, activities: 765, capacity: 93 },
  { id:'3', team:'Sul', conversion: 6.4, revenue: 940000, pipeline: 2760000, activities: 694, capacity: 96 },
  { id:'4', team:'Digital', conversion: 8.8, revenue: 760000, pipeline: 2970000, activities: 911, capacity: 79 },
]
export const demoAlerts: AlertItem[] = [
  { id:'a1', severity:'high', category:'Conversão', title:'Equipe Sul: conversão caiu 14%', problem:'Conversão abaixo do padrão no período selecionado.', evidence:'Queda concentrada na etapa Proposta → Venda e no canal WhatsApp.', probableCause:'Aumento de oportunidades sem atividade recente.', impact:'Risco de perda de receita estimado em R$ 286 mil.', recommendedAction:'Revisar oportunidades paradas e realizar reunião com a supervisão.', confidence:78, status:'open', createdAt:'2026-08-16T10:20:00-03:00' },
  { id:'a2', severity:'high', category:'Pipeline', title:'Pipeline com queda de 8%', problem:'Cobertura da meta ficou abaixo da faixa de segurança.', evidence:'Entrada de oportunidades caiu em duas origens relevantes.', probableCause:'Redução de geração de leads qualificados.', impact:'Forecast pode ficar 6,2% abaixo da meta.', recommendedAction:'Redistribuir capacidade e reforçar canais com melhor conversão.', confidence:84, status:'open', createdAt:'2026-08-16T09:55:00-03:00' },
  { id:'a3', severity:'medium', category:'Capacidade', title:'Equipe Norte com capacidade disponível', problem:'Capacidade produtiva está acima da demanda atual.', evidence:'12% de capacidade ociosa nos últimos 5 dias.', probableCause:'Distribuição desigual do pipeline entre equipes.', impact:'Oportunidade de acelerar follow-ups sem aumentar HC.', recommendedAction:'Transferir 80 oportunidades ativas para a Equipe Norte.', confidence:91, status:'open', createdAt:'2026-08-16T08:40:00-03:00' },
  { id:'a4', severity:'medium', category:'Qualidade', title:'37 oportunidades sem atividade', problem:'Oportunidades abertas há mais de 10 dias sem contato registrado.', evidence:'Concentradas em 7 vendedores.', probableCause:'Falha de cadência e priorização.', impact:'Aging médio do pipeline aumentou 2,4 dias.', recommendedAction:'Criar fila diária de retomada com SLA de 24h.', confidence:95, status:'acknowledged', createdAt:'2026-08-15T17:30:00-03:00' },
]
export const demoActions: ActionItem[] = [
  { id:'p1', title:'Revisar oportunidades paradas da Equipe Sul', owner:'Carla Mendes', dueDate:'2026-08-18', status:'in_progress', baseline:6.4 },
  { id:'p2', title:'Redistribuir 80 oportunidades para Equipe Norte', owner:'Marcos Lima', dueDate:'2026-08-17', status:'todo' },
  { id:'p3', title:'Implantar fila de retomada com SLA de 24h', owner:'Ana Souza', dueDate:'2026-08-20', status:'todo' },
  { id:'p4', title:'Validar impacto do canal WhatsApp no custo por venda', owner:'Financeiro', dueDate:'2026-08-21', status:'in_progress' },
]
export const demoOpportunities: Opportunity[] = [
  { id:'o1', company:'Grupo Atlas', owner:'João Lima', team:'Norte', source:'Google', stage:'Proposta', value:180000, probability:75, agingDays:4, status:'open' },
  { id:'o2', company:'Nova Rede', owner:'Amanda Alves', team:'Sul', source:'WhatsApp', stage:'Qualificação', value:95000, probability:45, agingDays:14, status:'open' },
  { id:'o3', company:'LogCom', owner:'Ricardo Nunes', team:'Centro', source:'Indicação', stage:'Negociação', value:240000, probability:85, agingDays:8, status:'open' },
  { id:'o4', company:'Via Connect', owner:'Bruna Costa', team:'Digital', source:'Meta Ads', stage:'Contato', value:70000, probability:30, agingDays:16, status:'open' },
  { id:'o5', company:'Call Prime', owner:'João Lima', team:'Norte', source:'Outbound', stage:'Venda', value:130000, probability:100, agingDays:6, status:'won' },
]
export const demoCosts: CostItem[] = [
  { id:'c1', category:'Salários e encargos', amount:710000, type:'fixed', period:'Ago/2026' },
  { id:'c2', category:'Benefícios e estrutura', amount:185000, type:'fixed', period:'Ago/2026' },
  { id:'c3', category:'Telefonia e CDR', amount:96000, type:'variable', period:'Ago/2026' },
  { id:'c4', category:'WhatsApp Business', amount:74000, type:'variable', period:'Ago/2026' },
  { id:'c5', category:'Licenças e sistemas', amount:115000, type:'fixed', period:'Ago/2026' },
]
export const demoSources: DataSource[] = [
  { id:'d1', name:'CRM Comercial', type:'API', status:'online', lastSync:'há 4 min', records:18420 },
  { id:'d2', name:'Discador / CDR', type:'API', status:'online', lastSync:'há 8 min', records:42681 },
  { id:'d3', name:'WhatsApp Business', type:'API oficial', status:'online', lastSync:'há 11 min', records:12910 },
  { id:'d4', name:'ERP Financeiro', type:'CSV', status:'attention', lastSync:'há 1 dia', records:3240 },
]
export const demoScenarios: Scenario[] = [
  { id:'s1', name:'Base atual', headcountDelta:0, capacityDelta:0, whatsappShare:28, hoursDelta:0, projectedCost:1180000, projectedRevenue:5100000, projectedRoi:3.32 },
  { id:'s2', name:'+8 agentes na Equipe Sul', headcountDelta:8, capacityDelta:12, whatsappShare:28, hoursDelta:0, projectedCost:1268000, projectedRevenue:5520000, projectedRoi:3.35 },
  { id:'s3', name:'WhatsApp 40% do volume', headcountDelta:0, capacityDelta:7, whatsappShare:40, hoursDelta:0, projectedCost:1210000, projectedRevenue:5410000, projectedRoi:3.47 },
]
