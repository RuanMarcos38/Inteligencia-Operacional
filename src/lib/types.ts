export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed'

export interface KPISet {
  revenueRealized: number
  revenueForecast: number
  pipelineValue: number
  conversionRate: number
  targetRevenue: number
  operationalCost: number
  roi: number
  productivity: number
  activeAgents: number
  avgAgingDays: number
}

export interface RevenuePoint { period: string; realized: number; forecast: number; target: number }
export interface TeamPerformance { id: string; team: string; conversion: number; revenue: number; pipeline: number; activities: number; capacity: number }
export interface AlertItem {
  id: string
  severity: Severity
  category: string
  title: string
  problem: string
  evidence: string
  probableCause: string
  impact: string
  recommendedAction: string
  confidence: number
  status: AlertStatus
  createdAt: string
}
export interface ActionItem { id: string; title: string; owner: string; dueDate: string; status: 'todo'|'in_progress'|'done'|'cancelled'; baseline?: number; result?: number }
export interface Opportunity { id: string; company: string; owner: string; team: string; source: string; stage: string; value: number; probability: number; agingDays: number; status: string }
export interface CostItem { id: string; category: string; amount: number; type: 'fixed'|'variable'; period: string }
export interface DataSource { id: string; name: string; type: string; status: string; lastSync: string; records: number }
export interface Scenario { id: string; name: string; headcountDelta: number; capacityDelta: number; whatsappShare: number; hoursDelta: number; projectedCost: number; projectedRevenue: number; projectedRoi: number }
