import { useEffect,useState } from 'react'
import { Sidebar,type PageKey } from './components/Sidebar'
import { Header } from './components/Header'
import { Dashboard } from './pages/Dashboard'
import { Sales } from './pages/Sales'
import { Operations } from './pages/Operations'
import { Planning } from './pages/Planning'
import { Costs } from './pages/Costs'
import { Intelligence } from './pages/Intelligence'
import { Actions } from './pages/Actions'
import { Scenarios } from './pages/Scenarios'
import { DataIntegrations } from './pages/DataIntegrations'
import { Governance } from './pages/Governance'
import { Settings } from './pages/Settings'
import { Auth } from './pages/Auth'
import { demoMode,supabase } from './lib/supabase'

const meta:Record<PageKey,[string,string]>={dashboard:['Visão executiva','O que aconteceu, onde está o risco e qual decisão merece prioridade.'],sales:['Funil comercial','Receita, conversão e pipeline com investigação até equipe e oportunidade.'],operations:['Operação','Produtividade, canais, metas, equipes e acompanhamento intradiário.'],planning:['Planejamento','Previsão de demanda, capacidade, dimensionamento e aderência.'],costs:['Custos e retorno','Quanto custa produzir, quanto retorna e onde existe eficiência.'],intelligence:['Inteligência operacional','Desvios, evidências, hipóteses, recomendações e confiança.'],actions:['Ações e decisões','Transforme recomendação em responsável, prazo, execução e resultado.'],scenarios:['Simulador','Compare impacto em capacidade, custo, produção, receita e ROI.'],data:['Dados e integrações','Consolide histórico de CRM, telefonia, WhatsApp, ERP, arquivos e APIs.'],governance:['Governança','Perfis, segregação, auditoria, rastreabilidade e qualidade dos dados.'],settings:['Configurações','Ambiente SaaS, backend, integrações e parâmetros operacionais.']}
function Page({page}:{page:PageKey}){return page==='dashboard'?<Dashboard/>:page==='sales'?<Sales/>:page==='operations'?<Operations/>:page==='planning'?<Planning/>:page==='costs'?<Costs/>:page==='intelligence'?<Intelligence/>:page==='actions'?<Actions/>:page==='scenarios'?<Scenarios/>:page==='data'?<DataIntegrations/>:page==='governance'?<Governance/>:<Settings/>}
export default function App(){const[page,setPage]=useState<PageKey>('dashboard');const[ready,setReady]=useState(false);const[authenticated,setAuthenticated]=useState(demoMode);const[demo,setDemo]=useState(demoMode);useEffect(()=>{if(!supabase){setReady(true);return}supabase.auth.getSession().then(({data})=>{setAuthenticated(Boolean(data.session)||demoMode);setReady(true)});const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{if(!demo)setAuthenticated(Boolean(s))});return()=>subscription.unsubscribe()},[demo]);if(!ready)return <div className="grid min-h-screen place-items-center bg-[#0b0a10] text-sm text-white/50">Inicializando...</div>;if(!authenticated)return <Auth onDemo={()=>{setDemo(true);setAuthenticated(true)}}/>;const[t,s]=meta[page];return <div className="min-h-screen bg-[#0b0a10] text-white"><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(52,211,153,.09),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,.06),transparent_28%)]"/><Sidebar page={page} onPage={setPage}/><main className="relative z-10 mx-auto max-w-[1680px] px-4 py-6 md:ml-72 md:px-6"><Header title={t} subtitle={s}/><Page page={page}/><footer className="py-8 text-center text-[10px] uppercase tracking-[.16em] text-white/20">Inteligência Operacional • Planejamento • Operação • Custos • Resultados • Previsão</footer></main></div>}
