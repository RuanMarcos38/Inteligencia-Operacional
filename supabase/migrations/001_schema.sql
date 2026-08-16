-- Inteligência Operacional SaaS — schema consolidado
create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  full_name text,
  role text not null default 'analyst' check (role in ('owner','admin','director','manager','supervisor','planner','analyst','finance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamptz not null default now()
);

create table if not exists public.operations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  name text not null,
  kind text not null default 'sales' check (kind in ('sales','collections','sac','custom')),
  channel text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.operations(id) on delete cascade,
  name text not null,
  supervisor_name text,
  capacity_daily numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  operation_id uuid references public.operations(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  external_id text,
  source text,
  channel text,
  product text,
  status text default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  operation_id uuid references public.operations(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  external_id text not null,
  company text,
  source text,
  stage text not null default 'lead',
  value numeric(14,2) not null default 0,
  probability numeric(5,2) not null default 0 check (probability between 0 and 100),
  expected_close_date date,
  last_activity_at timestamptz,
  lost_reason text,
  status text not null default 'open' check (status in ('open','won','lost','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, external_id)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  kind text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  operation_id uuid references public.operations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  metric text not null,
  period_start date not null,
  period_end date not null,
  target_value numeric(14,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.costs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  operation_id uuid references public.operations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  category text not null,
  cost_type text not null default 'variable' check (cost_type in ('fixed','variable')),
  amount numeric(14,2) not null,
  period_start date not null,
  period_end date not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.data_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  type text not null,
  status text not null default 'online',
  last_sync_at timestamptz,
  records_count bigint not null default 0,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_id uuid references public.data_sources(id) on delete set null,
  file_name text,
  status text not null default 'queued',
  rows_total integer default 0,
  rows_valid integer default 0,
  rows_invalid integer default 0,
  duplicates integer default 0,
  errors jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  operation_id uuid references public.operations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  category text not null,
  title text not null,
  problem text not null,
  evidence text,
  probable_cause text,
  impact text,
  recommended_action text,
  confidence numeric(5,2) check (confidence between 0 and 100),
  fingerprint text,
  status text not null default 'open' check (status in ('open','acknowledged','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create unique index if not exists alerts_open_fingerprint
  on public.alerts(organization_id, fingerprint)
  where status in ('open','acknowledged') and fingerprint is not null;

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references public.alerts(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recommendation text not null,
  priority text not null default 'medium',
  confidence numeric(5,2),
  created_at timestamptz not null default now()
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  decision text not null check (decision in ('approve','reject','adjust','postpone')),
  justification text,
  decided_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.action_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recommendation_id uuid references public.recommendations(id) on delete set null,
  title text not null,
  owner_name text,
  owner_user_id uuid references auth.users(id) on delete set null,
  due_date date,
  status text not null default 'todo' check (status in ('todo','in_progress','done','cancelled')),
  evidence text,
  baseline_value numeric(14,2),
  result_value numeric(14,2),
  result_type text check (result_type in ('observed','estimated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  operation_id uuid references public.operations(id) on delete cascade,
  name text not null,
  assumptions jsonb not null default '{}'::jsonb,
  projected_capacity_delta numeric(12,2),
  projected_cost numeric(14,2),
  projected_revenue numeric(14,2),
  projected_roi numeric(12,4),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_opp_org_status on public.opportunities(organization_id,status);
create index if not exists idx_opp_team on public.opportunities(team_id);
create index if not exists idx_activities_org_date on public.activities(organization_id,occurred_at desc);
create index if not exists idx_alerts_org_status on public.alerts(organization_id,status,created_at desc);
create index if not exists idx_actions_org_status on public.action_plans(organization_id,status,due_date);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_org_id()
returns uuid language sql stable security definer set search_path=public as $$
  select organization_id from public.profiles where id=auth.uid();
$$;
