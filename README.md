# Inteligência Operacional — SaaS

Plataforma independente do Lovable para transformar dados operacionais, financeiros e comerciais em decisões acionáveis.

## Escopo consolidado

Os dois documentos de produto foram unificados sem repetir módulos. O núcleo final contém:

- Visão executiva: Receita → Conversão → Pipeline
- Planejamento: demanda, capacidade, HC, aderência e intradiário
- Operação: produtividade, canais, metas e equipes
- Funil comercial: oportunidades, aging, probabilidade e forecast
- Custos e ROI: custos fixos/variáveis e indicadores unitários
- Inteligência operacional: regras explicáveis, desvios, contexto, evidência, impacto e recomendação
- Decisões e planos de ação: responsável, prazo, status, evidência e resultado
- Simulação de cenários: HC, capacidade, WhatsApp, custo, receita e ROI
- Dados e integrações: API/CSV, CRM, discador/CDR, WhatsApp Business, ERP e histórico
- Governança SaaS: multiempresa, perfis, RLS, auditoria e rastreabilidade

O sistema **não tenta duplicar** CRM completo, discador, ERP, WFM completo ou speech analytics. Esses itens entram como fontes/conectores, conforme o próprio recorte do MVP.


## Decision Intelligence V2

A camada de gestão foi ampliada para transformar o painel em uma **central de decisão**, mantendo o mesmo shell visual do template original anexado: sidebar flutuante em liquid glass, navegação compactável, fundo escuro com profundidade, cards arredondados e navegação mobile.

Novos recursos:

- Scorecards executivos com meta, forecast, tendência, confiança e freshness
- Fila de prioridades ordenada por severidade, impacto, confiança e urgência
- Briefing executivo automático com sinais positivos, riscos e decisões sugeridas
- Análise de drivers para explicar o que mais contribui para a variação do resultado
- Mapa de risco operacional por equipe com probabilidade, impacto e exposição
- Índice de confiança do dado: atualização, completude, consistência e duplicidade
- Copiloto de Gestão com perguntas em linguagem natural e respostas explicáveis
- Camada semântica de métricas, regras de alerta, checks de qualidade, briefs e views salvas no backend
- Ciclo fechado: dado → contexto → decisão → ação → resultado → aprendizado

A proposta continua sendo uma camada de inteligência sobre CRM, ERP, telefonia, WhatsApp e demais fontes, sem reconstruir essas ferramentas dentro do SaaS.

## Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS 4
- Recharts
- Supabase Auth + PostgreSQL + RLS
- Backend versionado em `supabase/migrations/`
- GitHub Actions para build

Não existe dependência de `@lovable.dev/*`.

## Rodar localmente

```bash
cp .env.example .env
npm install
npm run dev
```

Por padrão `VITE_DEMO_MODE=true`, permitindo abrir toda a interface imediatamente.

## Ativar backend real

1. Crie/use um projeto Supabase.
2. Execute as migrations de `supabase/migrations/` em ordem (`001`, `002`, `003`).
3. Preencha:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_DEMO_MODE=false
```

4. Crie o primeiro usuário pela tela de cadastro. O trigger cria automaticamente organização, perfil, unidade e operação inicial.

## CSV

Importação MVP aceita, no mínimo:

```csv
external_id,stage,value,probability,status,company,source
OP-001,Proposta,150000,70,open,Empresa Exemplo,Google
```

A importação consolida `external_id` repetido antes do `upsert` e a base possui chave única `(organization_id, external_id)`.

## Backend

O migration inclui entidades, RLS e funções para:

- `executive_kpis`
- `revenue_trend`
- `team_performance`
- `run_intelligence_rules`

O motor de inteligência começa com regras transparentes e auditáveis, conforme o escopo do MVP, e pode evoluir para modelos estatísticos/IA sem substituir a explicabilidade.

## Deploy fora do Lovable

O frontend gera arquivos estáticos com `npm run build`. Pode ser publicado em Hostinger, Cloudflare Pages, Vercel, Netlify ou servido por Nginx/EasyPanel. O backend fica no Supabase/Postgres.
