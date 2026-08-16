import { useEffect,useState } from 'react'
import { Sidebar,type PageKey } from './components/Sidebar'
import { Header } from './components/Header'
import DarkVeil from './components/DarkVeil'
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
import { Copilot } from './pages/Copilot'
import { Settings } from './pages/Settings'
import { Auth } from './pages/Auth'
import { demoMode,supabase } from './lib/supabase'

const meta:Record<PageKey,[string,string]>={dashboard:['Visão executiva','O que aconteceu, por que aconteceu, qual é o impacto e qual decisão merece prioridade agora.'],sales:['Funil comercial','Receita, conversão e pipeline com investigação até equipe, canal, etapa e oportunidade.'],operations:['Operação','Produtividade, canais, metas, capacidade e acompanhamento intradiário.'],planning:['Planejamento','Previsão de demanda, capacidade, dimensionamento, aderência e risco de saturação.'],costs:['Custos e retorno','Quanto custa produzir, quanto retorna e onde existe eficiência marginal.'],intelligence:['Inteligência operacional','Desvios, evidências, causas prováveis, recomendações, confiança e criticidade.'],actions:['Decisões e ações','Transforme recomendação em decisão, responsável, prazo, execução, evidência e resultado.'],scenarios:['Simulador','Compare impacto em capacidade, custo, produção, receita e ROI antes de executar.'],data:['Dados e integrações','Consolide histórico de CRM, telefonia, WhatsApp, ERP, arquivos e APIs com confiança do dado.'],governance:['Governança','Perfis, segregação, auditoria, rastreabilidade, qualidade, linhagem e revisão humana.'],copilot:['Copiloto de Gestão','Faça perguntas em linguagem natural e receba respostas explicáveis orientadas à decisão.'],settings:['Configurações','Ambiente SaaS, backend, integrações, metas, parâmetros e regras operacionais.']}
function Page({page}:{page:PageKey}){return page==='dashboard'?<Dashboard/>:page==='sales'?<Sales/>:page==='operations'?<Operations/>:page==='planning'?<Planning/>:page==='costs'?<Costs/>:page==='intelligence'?<Intelligence/>:page==='actions'?<Actions/>:page==='scenarios'?<Scenarios/>:page==='data'?<DataIntegrations/>:page==='governance'?<Governance/>:page==='copilot'?<Copilot/>:<Settings/>}
export default function App(){const[page,setPage]=useState<PageKey>('dashboard');const[ready,setReady]=useState(false);const[authenticated,setAuthenticated]=useState(demoMode);const[demo,setDemo]=useState(demoMode);useEffect(()=>{if(!supabase){setReady(true);return}supabase.auth.getSession().then(({data})=>{setAuthenticated(Boolean(data.session)||demoMode);setReady(true)});const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{if(!demo)setAuthenticated(Boolean(s))});return()=>subscription.unsubscribe()},[demo]);if(!ready)return <div className="grid min-h-screen place-items-center bg-[#0b0a10] text-sm text-white/50">Inicializando...</div>;if(!authenticated)return <Auth onDemo={()=>{setDemo(true);setAuthenticated(true)}}/>;const[t,s]=meta[page];return <div className="dark relative isolate min-h-app pb-24 text-foreground md:pb-8"><div className="pointer-events-none fixed inset-0 -z-20"><DarkVeil/></div><div className="pointer-events-none fixed inset-0 -z-10 bg-[#0b0a10]/75"/><Sidebar page={page} onPage={setPage}/><main className="app-main relative z-10 mx-auto max-w-[1680px] px-4 py-6 md:px-6"><Header title={t} subtitle={s}/><Page page={page}/><footer className="py-8 text-center text-[9px] uppercase tracking-[.16em] text-white/20">Inteligência Operacional • Dados → Contexto → Decisão → Ação → Resultado</footer></main></div>}
