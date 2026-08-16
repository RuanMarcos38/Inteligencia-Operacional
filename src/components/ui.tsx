import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export function Panel({title,subtitle,action,children,className=''}:{title?:string;subtitle?:string;action?:ReactNode;children:ReactNode;className?:string}){
  return <section className={`glass rounded-3xl p-5 ${className}`}>
    {(title||action)&&<div className="mb-4 flex items-start justify-between gap-4"><div>{title&&<h2 className="text-base font-semibold tracking-tight">{title}</h2>}{subtitle&&<p className="mt-1 text-xs text-white/50">{subtitle}</p>}</div>{action}</div>}
    {children}
  </section>
}
export function MetricCard({label,value,detail,trend,tone='default'}:{label:string;value:string;detail?:string;trend?:number;tone?:'default'|'positive'|'warning'}){
  const glow=tone==='positive'?'from-emerald-400/10':tone==='warning'?'from-amber-400/10':'from-white/[.035]'
  return <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${glow} to-transparent p-5`}>
    <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-white/45">{label}</p>
    <div className="mt-3 flex items-end justify-between gap-2"><p className="text-2xl font-semibold tracking-tight">{value}</p>{typeof trend==='number'&&<span className={`inline-flex items-center gap-1 text-xs ${trend>=0?'text-emerald-300':'text-rose-300'}`}>{trend>=0?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>} {Math.abs(trend)}%</span>}</div>
    {detail&&<p className="mt-2 text-xs text-white/45">{detail}</p>}
  </div>
}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:'neutral'|'green'|'amber'|'red'|'blue'}){
  const c={neutral:'bg-white/7 text-white/65 ring-white/10',green:'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',amber:'bg-amber-400/10 text-amber-300 ring-amber-400/20',red:'bg-rose-400/10 text-rose-300 ring-rose-400/20',blue:'bg-sky-400/10 text-sky-300 ring-sky-400/20'}[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${c}`}>{children}</span>
}
export function Button({children,onClick,variant='primary',type='button',disabled=false}:{children:ReactNode;onClick?:()=>void;variant?:'primary'|'ghost'|'danger';type?:'button'|'submit';disabled?:boolean}){
  const c=variant==='primary'?'bg-emerald-400 text-[#07110d] hover:bg-emerald-300':variant==='danger'?'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/20 hover:bg-rose-500/25':'bg-white/6 text-white/75 ring-1 ring-white/10 hover:bg-white/10'
  return <button type={type} disabled={disabled} onClick={onClick} className={`rounded-2xl px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${c}`}>{children}</button>
}
export function Empty({text}:{text:string}){return <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/40">{text}</div>}
