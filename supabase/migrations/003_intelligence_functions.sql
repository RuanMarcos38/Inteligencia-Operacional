-- Motores de cálculo e inteligência operacional explicável
create or replace function public.executive_kpis(p_organization_id uuid)
returns table(revenue_realized numeric,revenue_forecast numeric,pipeline_value numeric,conversion_rate numeric,target_revenue numeric,operational_cost numeric,roi numeric,productivity numeric,active_agents bigint,avg_aging_days numeric)
language sql stable security invoker as $$
with o as (select * from public.opportunities where organization_id=p_organization_id),
g as (select coalesce(sum(target_value),0) v from public.goals where organization_id=p_organization_id and metric='revenue' and current_date between period_start and period_end),
c as (select coalesce(sum(amount),0) v from public.costs where organization_id=p_organization_id and current_date between period_start and period_end),
a as (select count(*) v from public.agents ag join public.teams t on t.id=ag.team_id join public.operations op on op.id=t.operation_id where op.organization_id=p_organization_id and ag.active),
act as (select count(*) v from public.activities where organization_id=p_organization_id and occurred_at>=date_trunc('month',now()))
select
 coalesce(sum(value) filter(where status='won'),0),
 coalesce(sum(value*(probability/100.0)) filter(where status='open'),0),
 coalesce(sum(value) filter(where status='open'),0),
 case when count(*)=0 then 0 else round(count(*) filter(where status='won')::numeric/count(*)::numeric*100,2) end,
 g.v,c.v,case when c.v=0 then 0 else round((coalesce(sum(value) filter(where status='won'),0)-c.v)/c.v,2) end,
 case when a.v=0 then 0 else round(act.v::numeric/(a.v*176)*100,2) end,a.v,
 coalesce(round(avg(extract(epoch from(now()-coalesce(last_activity_at,created_at)))/86400) filter(where status='open'),2),0)
from o,g,c,a,act group by g.v,c.v,a.v,act.v; $$;

grant execute on function public.executive_kpis(uuid) to authenticated;

create or replace function public.revenue_trend(p_organization_id uuid,p_months int default 6)
returns table(period text,realized numeric,forecast numeric,target numeric) language sql stable security invoker as $$
with months as (select generate_series(date_trunc('month',now())-(p_months-1||' months')::interval,date_trunc('month',now()),'1 month') m)
select to_char(m,'Mon') period,
 coalesce((select sum(value) from public.opportunities where organization_id=p_organization_id and status='won' and created_at>=m and created_at<m+'1 month'::interval),0) realized,
 coalesce((select sum(value*(probability/100.0)) from public.opportunities where organization_id=p_organization_id and status='open' and expected_close_date>=m::date and expected_close_date<(m+'1 month'::interval)::date),0) forecast,
 coalesce((select sum(target_value) from public.goals where organization_id=p_organization_id and metric='revenue' and period_start<(m+'1 month'::interval)::date and period_end>=m::date),0) target from months order by m; $$;
grant execute on function public.revenue_trend(uuid,int) to authenticated;

create or replace function public.team_performance(p_organization_id uuid)
returns table(id uuid,team text,conversion numeric,revenue numeric,pipeline numeric,activities bigint,capacity numeric) language sql stable security invoker as $$
select t.id,t.name,
 case when count(o.id)=0 then 0 else round(count(o.id) filter(where o.status='won')::numeric/count(o.id)::numeric*100,2) end,
 coalesce(sum(o.value) filter(where o.status='won'),0),coalesce(sum(o.value) filter(where o.status='open'),0),
 (select count(*) from public.activities a where a.organization_id=p_organization_id and a.agent_id in(select id from public.agents where team_id=t.id) and a.occurred_at>=date_trunc('month',now())),
 coalesce(t.capacity_daily,0)
from public.teams t join public.operations op on op.id=t.operation_id left join public.opportunities o on o.team_id=t.id where op.organization_id=p_organization_id group by t.id,t.name,t.capacity_daily; $$;
grant execute on function public.team_performance(uuid) to authenticated;

-- Explainable rule engine. It intentionally starts with transparent business rules rather than opaque ML.
create or replace function public.run_intelligence_rules(p_organization_id uuid) returns jsonb language plpgsql security invoker as $$
declare gen int:=0; stale int:=0; dup int:=0; conv numeric:=0;
begin
  select count(*) into stale from public.opportunities where organization_id=p_organization_id and status='open' and coalesce(last_activity_at,created_at)<now()-interval '10 days';
  select case when count(*)=0 then 0 else count(*) filter(where status='won')::numeric/count(*)::numeric*100 end into conv from public.opportunities where organization_id=p_organization_id;
  select count(*) into dup from (select external_id from public.opportunities where organization_id=p_organization_id group by external_id having count(*)>1) x;
  if stale>0 then
    insert into public.alerts(organization_id,severity,category,title,problem,evidence,probable_cause,impact,recommended_action,confidence,fingerprint)
    values(p_organization_id,case when stale>=30 then 'high' else 'medium' end,'Processo',stale||' oportunidades sem atividade','Oportunidades abertas ultrapassaram 10 dias sem atividade registrada.',stale||' registros fora do SLA de acompanhamento.','Cadência de follow-up insuficiente ou distribuição de carteira inadequada.','Aging do pipeline aumenta e reduz a probabilidade de fechamento.','Criar fila de retomada com responsável e SLA de 24h.',95,'stale-opportunities') on conflict do nothing; gen:=gen+1;
  end if;
  if conv<7 then
    insert into public.alerts(organization_id,severity,category,title,problem,evidence,probable_cause,impact,recommended_action,confidence,fingerprint)
    values(p_organization_id,'high','Conversão','Conversão abaixo da referência','Taxa consolidada abaixo de 7%.','Conversão atual: '||round(conv,2)||'%.','Pode haver concentração de perdas em equipe, canal ou etapa.','Risco de fechamento abaixo da meta.','Analisar conversão por equipe e atacar oportunidades com maior valor e aging.',78,'low-conversion') on conflict do nothing; gen:=gen+1;
  end if;
  if dup>0 then
    insert into public.alerts(organization_id,severity,category,title,problem,evidence,probable_cause,impact,recommended_action,confidence,fingerprint)
    values(p_organization_id,'medium','Qualidade','Duplicidades identificadas','A base possui identificadores externos repetidos.',dup||' IDs externos duplicados.','Carga de dados sem chave de idempotência.','Indicadores podem ficar superestimados.','Consolidar duplicidades pela chave external_id antes da próxima carga.',99,'duplicate-data') on conflict do nothing; gen:=gen+1;
  end if;
  return jsonb_build_object('generated',gen,'stale',stale,'conversion',round(conv,2),'duplicates',dup);
end; $$;
grant execute on function public.run_intelligence_rules(uuid) to authenticated;
