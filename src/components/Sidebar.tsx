import { Activity,BarChart3,BrainCircuit,Calculator,ChevronLeft,ChevronRight,Database,Gauge,Goal,Landmark,ListChecks,Menu,Settings2,ShieldCheck,Sparkles,UsersRound,X } from 'lucide-react'
import { useEffect,useState } from 'react'

export type PageKey='dashboard'|'sales'|'operations'|'planning'|'costs'|'intelligence'|'actions'|'scenarios'|'data'|'governance'|'copilot'|'settings'
const items:[PageKey,string,any][]=[
  ['dashboard','Visão executiva',Gauge],['sales','Funil comercial',BarChart3],['operations','Operação',Activity],['planning','Planejamento',Goal],['costs','Custos e ROI',Landmark],['intelligence','Inteligência',BrainCircuit],['actions','Decisões e ações',ListChecks],['scenarios','Simulador',Calculator],['data','Dados e integrações',Database],['governance','Governança',ShieldCheck],['copilot','Copiloto de Gestão',Sparkles],['settings','Configurações',Settings2],
]
const quick:PageKey[]=['dashboard','intelligence','actions','copilot']
const STORAGE='io-sidenav-collapsed'

export function Sidebar({page,onPage}:{page:PageKey;onPage:(p:PageKey)=>void}){
  const[collapsed,setCollapsed]=useState(false);const[more,setMore]=useState(false)
  useEffect(()=>{try{setCollapsed(localStorage.getItem(STORAGE)==='1')}catch{}},[])
  useEffect(()=>{document.documentElement.style.setProperty('--sidenav-width',collapsed?'5rem':'15rem');try{localStorage.setItem(STORAGE,collapsed?'1':'0')}catch{}},[collapsed])
  const go=(p:PageKey)=>{onPage(p);setMore(false)}
  return <>
    <aside className="sidenav hidden md:flex" style={{width:collapsed?'5rem':'15rem'}}>
      <div className="flex items-center justify-between px-4 pb-4 pt-5">{!collapsed&&<div className="min-w-0"><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground"><UsersRound size={17}/></div><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-white">INTELIGÊNCIA</p><p className="text-[9px] uppercase tracking-[.14em] text-white/35">Operacional</p></div></div></div>}<button aria-label={collapsed?'Expandir menu':'Recolher menu'} className={`grid size-8 place-items-center rounded-full text-white/65 transition hover:bg-white/5 hover:text-white ${collapsed?'mx-auto':''}`} onClick={()=>setCollapsed(v=>!v)}>{collapsed?<ChevronRight size={16}/>:<ChevronLeft size={16}/>}</button></div>
      <div className="px-2 pb-3"><button onClick={()=>go('copilot')} className={`flex h-11 w-full items-center gap-3 rounded-2xl bg-primary font-semibold text-primary-foreground shadow-[0_8px_24px_-6px_rgba(52,211,153,.5)] ring-1 ring-white/15 active:scale-[.98] ${collapsed?'justify-center':'justify-center px-4 text-sm'}`}><Sparkles size={18}/>{!collapsed&&<span>Nova análise</span>}</button></div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-3 pt-2">{items.map(([key,label,Icon])=>{const active=page===key;return <button key={key} title={collapsed?label:undefined} onClick={()=>go(key)} className={`relative flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors ${collapsed?'justify-center':''} ${active?'bg-primary text-primary-foreground shadow-[0_4px_18px_-2px_rgba(52,211,153,.42)]':'text-white/60 hover:bg-white/5 hover:text-white'}`}><Icon size={18}/>{!collapsed&&<span className="truncate">{label}</span>}</button>})}</nav>
      {!collapsed&&<div className="mx-3 mb-3 rounded-2xl bg-white/[.04] p-3 ring-1 ring-white/8"><p className="text-[9px] uppercase tracking-[.16em] text-white/30">Decision Intelligence</p><p className="mt-1 text-[11px] font-medium">Do dado à decisão, com impacto e evidência.</p></div>}
    </aside>

    <nav className="mobile-nav md:hidden"><div className="flex items-center justify-around gap-1">{quick.map(key=>{const row=items.find(x=>x[0]===key)!;const Icon=row[2];const active=page===key;return <button key={key} onClick={()=>go(key)} className={`flex min-w-14 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[9px] font-medium ${active?'bg-primary text-primary-foreground':'text-white/55'}`}><Icon size={17}/><span>{row[1].split(' ')[0]}</span></button>})}<button onClick={()=>setMore(true)} className="flex min-w-14 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[9px] font-medium text-white/55"><Menu size={17}/><span>Mais</span></button></div></nav>
    {more&&<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden" onClick={()=>setMore(false)}><div className="absolute inset-x-3 bottom-3 rounded-3xl border border-white/10 bg-[#121117]/95 p-4 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-semibold">Navegação</p><p className="text-[10px] text-white/35">Acesse todos os módulos</p></div><button onClick={()=>setMore(false)} className="grid size-8 place-items-center rounded-full bg-white/5"><X size={15}/></button></div><div className="grid grid-cols-2 gap-2">{items.filter(([k])=>!quick.includes(k)).map(([key,label,Icon])=><button key={key} onClick={()=>go(key)} className={`flex items-center gap-2 rounded-2xl p-3 text-left text-xs ring-1 ${page===key?'bg-primary text-primary-foreground ring-primary':'bg-white/[.04] text-white/65 ring-white/8'}`}><Icon size={16}/>{label}</button>)}</div></div></div>}
  </>
}
