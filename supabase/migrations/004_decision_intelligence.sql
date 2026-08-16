-- Decision Intelligence: semantic metrics, alert rules, data trust and executive briefs.
-- Adds decision-support capabilities without duplicating CRM/ERP/BI source systems.

create table if not exists public.metric_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  domain text not null default 'management',
  unit text not null default 'number',
  direction text not null default 'higher_is_better' check (direction in ('higher_is_better','lower_is_better','target_range')),
  target_value numeric(18,4),
  warning_value numeric(18,4),
  critical_value numeric(18,4),
  owner_name text,
  source_note text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id,code)
);

create table if not exists public.metric_snapshots (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  metric_id uuid not null references public.metric_definitions(id) on delete cascade,
  operation_id uuid references public.operations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  value numeric(18,4) not null,
  target_value numeric(18,4),
  forecast_value numeric(18,4),
  confidence numeric(5,2) check (confidence between 0 and 100),
  dimensions jsonb not null default '{}'::jsonb,
  source_updated_at timestamptz,
  observed_at timestamptz not null default now()
);

create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  metric_id uuid references public.metric_definitions(id) on delete cascade,
  name text not null,
  condition_type text not null check (condition_type in ('above','below','outside_range','change_pct','trend_down','trend_up','stale_data','missing_data')),
  threshold numeric(18,4),
  threshold_secondary numeric(18,4),
  window_minutes integer not null default 60,
  consecutive_hits integer not null default 1,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  cooldown_minutes integer not null default 240,
  action_hint text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_quality_checks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_id uuid references public.data_sources(id) on delete cascade,
  check_type text not null check (check_type in ('freshness','completeness','uniqueness','consistency','reconciliation','volume')),
  score numeric(5,2) not null check (score between 0 and 100),
  status text not null default 'healthy' check (status in ('healthy','attention','risk')),
  records_checked bigint not null default 0,
  issues_found bigint not null default 0,
  details jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now()
);

create table if not exists public.executive_briefs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  period_start date,
  period_end date,
  headline text not null,
  summary text not null,
  positives jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  decisions jsonb not null default '[]'::jsonb,
  data_confidence numeric(5,2) check (data_confidence between 0 and 100),
  generated_by uuid references auth.users(id) on delete set null,
  generated_at timestamptz not null default now()
);

create table if not exists public.saved_views (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  view_key text not null,
  filters jsonb not null default '{}'::jsonb,
  layout jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_metric_snapshots_lookup on public.metric_snapshots(organization_id,metric_id,observed_at desc);
create index if not exists idx_quality_checks_org_date on public.data_quality_checks(organization_id,checked_at desc);
create index if not exists idx_alert_rules_org_active on public.alert_rules(organization_id,active);
create index if not exists idx_exec_briefs_org_date on public.executive_briefs(organization_id,generated_at desc);

alter table public.metric_definitions enable row level security;
alter table public.metric_snapshots enable row level security;
alter table public.alert_rules enable row level security;
alter table public.data_quality_checks enable row level security;
alter table public.executive_briefs enable row level security;
alter table public.saved_views enable row level security;

do $$ declare t text; begin
  foreach t in array array['metric_definitions','metric_snapshots','alert_rules','data_quality_checks','executive_briefs','saved_views'] loop
    execute format('drop policy if exists tenant_all on public.%I',t);
    execute format('create policy tenant_all on public.%I for all using (organization_id=public.current_org_id()) with check (organization_id=public.current_org_id())',t);
  end loop;
end $$;

create trigger metric_definitions_touch before update on public.metric_definitions for each row execute procedure public.touch_updated_at();
create trigger alert_rules_touch before update on public.alert_rules for each row execute procedure public.touch_updated_at();
create trigger saved_views_touch before update on public.saved_views for each row execute procedure public.touch_updated_at();

grant select,insert,update,delete on public.metric_definitions,public.metric_snapshots,public.alert_rules,public.data_quality_checks,public.executive_briefs,public.saved_views to authenticated;
grant usage,select on all sequences in schema public to authenticated;

-- Returns a compact trust score used to qualify management recommendations.
create or replace function public.data_trust_score(p_organization_id uuid)
returns table(score numeric,freshness numeric,completeness numeric,consistency numeric,uniqueness numeric)
language sql stable security invoker as $$
with latest as (
  select distinct on (coalesce(source_id,'00000000-0000-0000-0000-000000000000'::uuid),check_type)
    check_type,score
  from public.data_quality_checks
  where organization_id=p_organization_id
  order by coalesce(source_id,'00000000-0000-0000-0000-000000000000'::uuid),check_type,checked_at desc
), vals as (
  select
    coalesce(avg(score) filter(where check_type='freshness'),100) freshness,
    coalesce(avg(score) filter(where check_type='completeness'),100) completeness,
    coalesce(avg(score) filter(where check_type in ('consistency','reconciliation')),100) consistency,
    coalesce(avg(score) filter(where check_type='uniqueness'),100) uniqueness
  from latest
)
select round(freshness*.30+completeness*.25+consistency*.30+uniqueness*.15,2),freshness,completeness,consistency,uniqueness from vals;
$$;
grant execute on function public.data_trust_score(uuid) to authenticated;

-- Executive priority view: ranks open alerts using severity, confidence and recency.
create or replace view public.decision_priority_queue with (security_invoker=true) as
select a.*,
  (case a.severity when 'critical' then 100 when 'high' then 80 when 'medium' then 55 else 25 end)
  + coalesce(a.confidence,50)*.15
  + greatest(0,20-extract(epoch from(now()-a.created_at))/86400)::numeric as priority_score
from public.alerts a
where a.status in ('open','acknowledged');
grant select on public.decision_priority_queue to authenticated;
