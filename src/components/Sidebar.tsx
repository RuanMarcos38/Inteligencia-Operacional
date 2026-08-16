import { Activity, BarChart3, BrainCircuit, Calculator, ChevronLeft, ChevronRight, Database, Gauge, Goal, Landmark, ListChecks, Settings2, ShieldCheck, UsersRound } from 'lucide-react'
import { useState } from 'react'

export type PageKey='dashboard'|'sales'|'operations'|'planning'|'costs'|'intelligence'|'actions'|'scenarios'|'data'|'governance'|'settings'
const items:[PageKey,string,any][]=[
  ['dashboard','Visão executiva',Gauge],['sales','Funil comercial',BarChart3],['operations','Operação',Activity],['planning','Planejamento',Goal],['costs','Custos e ROI',Landmark],['intelligence','Inteligência',BrainCircuit],['actions','Ações',ListChecks],['scenarios','Simulador',Calculator],['data','Dados e integrações',Database],['governance','Governança',ShieldCheck],['settings','Configurações',Settings2],
]
export function Sidebar({page,onPage}:{page:PageKey;onPage:(p:PageKey)=>void}){
  const [collapsed,setCollapsed]=useState(false)
  return <aside className={`fixed inset-y-3 left-3 z-30 hidden flex-col rounded-[28px] border border-white/10 bg-black/45 backdrop-blur-2xl md:flex transition-all ${collapsed?'w-20':'w-64'}`}>
    <div className="flex h-20 items-center justify-between px-4"><div className={`min-w-0 ${collapsed?'hidden':''}`}><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-xl bg-emerald-400 text-[#07110d]"><UsersRound size={17}/></div><div><p className="text-[11px] font-bold uppercase tracking-[.2em]">INTELIGÊNCIA</p><p className="text-[10px] text-white/40">Operacional</p></div></div></div><button className="grid size-9 place-items-center rounded-xl text-white/50 hover:bg-white/5 hover:text-white" onClick={()=>setCollapsed(v=>!v)}>{collapsed?<ChevronRight size={17}/>:<ChevronLeft size={17}/>}</button></div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">{items.map(([key,label,Icon])=>{const active=page===key;return <button key={key} onClick={()=>onPage(key)} className={`flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm transition ${collapsed?'justify-center':''} ${active?'bg-emerald-400 text-[#07110d] shadow-lg shadow-emerald-500/15':'text-white/60 hover:bg-white/5 hover:text-white'}`}><Icon size={18}/>{!collapsed&&<span className="truncate font-medium">{label}</span>}</button>})}</nav>
    <div className={`m-3 rounded-2xl bg-white/[.045] p-3 ring-1 ring-white/8 ${collapsed?'hidden':''}`}><p className="text-[10px] uppercase tracking-[.16em] text-white/35">Produto</p><p className="mt-1 text-xs font-medium">Gestão Inteligente de Operações</p><p className="mt-2 text-[11px] leading-4 text-white/40">Planejamento • custos • resultados • previsão</p></div>
  </aside>
}
