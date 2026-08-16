# Arquitetura consolidada

## Fluxo central

Fontes de dados → Base histórica → Motores de cálculo → Inteligência operacional → Visão de gestão → Decisão → Ação → Resultado.

## Núcleo do produto

O produto foi organizado em um único núcleo, evitando repetir responsabilidades entre módulos:

1. Dados e integrações: CSV/API, CRM, discador/CDR, WhatsApp Business, ERP e histórico.
2. Planejamento: demanda, capacidade, HC, aderência e acompanhamento intradiário.
3. Operação: produtividade, canais, metas e equipes.
4. Funil comercial: Receita → Conversão → Pipeline, com aging, forecast e investigação por equipe.
5. Custos e retorno: custo operacional, custo unitário, receita, forecast e ROI.
6. Inteligência: regras explicáveis, desvios, evidência, causa provável, impacto, recomendação e confiança.
7. Decisão e execução: aprovar/rejeitar/ajustar/adiar, responsável, prazo, status, evidência e resultado.
8. Simulação: variação de HC, capacidade, participação do WhatsApp, custo, receita e ROI.
9. Governança: multiempresa, perfis, RLS, rastreabilidade e auditoria.

## O que não é duplicado

CRM completo, discador próprio, ERP, WFM completo e speech analytics não são reconstruídos dentro do núcleo. A plataforma consome esses sistemas como fontes e concentra inteligência, planejamento, custo, decisão e acompanhamento.

## SaaS

Cada usuário pertence a uma organização. As tabelas de negócio são segregadas por `organization_id` e protegidas por Row Level Security. O cadastro do primeiro usuário cria automaticamente a organização e a operação inicial.
