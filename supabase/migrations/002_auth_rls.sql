-- Auth, multi-tenant RLS, grants e views
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare org_id uuid; org_name text; org_slug text;
begin
  org_name := coalesce(new.raw_user_meta_data->>'organization_name', split_part(new.email,'@',1)||' Workspace');
  org_slug := regexp_replace(lower(split_part(new.email,'@',1)||'-'||substr(new.id::text,1,8)), '[^a-z0-9-]+','-','g');
  insert into public.organizations(name,slug) values(org_name,org_slug) returning id into org_id;
  insert into public.profiles(id,organization_id,full_name,role) values(new.id,org_id,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)),'owner');
  insert into public.units(organization_id,name,code) values(org_id,'Unidade Principal','MATRIZ');
  insert into public.operations(organization_id,name,kind,channel) values(org_id,'Operação Comercial','sales','omnichannel');
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_touch on public.profiles; create trigger profiles_touch before update on public.profiles for each row execute procedure public.touch_updated_at();
drop trigger if exists leads_touch on public.leads; create trigger leads_touch before update on public.leads for each row execute procedure public.touch_updated_at();
drop trigger if exists opp_touch on public.opportunities; create trigger opp_touch before update on public.opportunities for each row execute procedure public.touch_updated_at();
drop trigger if exists actions_touch on public.action_plans; create trigger actions_touch before update on public.action_plans for each row execute procedure public.touch_updated_at();

-- Multi-tenant RLS
alter table public.organizations enable row level security; alter table public.profiles enable row level security; alter table public.units enable row level security;
alter table public.operations enable row level security; alter table public.teams enable row level security; alter table public.agents enable row level security;
alter table public.leads enable row level security; alter table public.opportunities enable row level security; alter table public.activities enable row level security;
alter table public.goals enable row level security; alter table public.costs enable row level security; alter table public.data_sources enable row level security;
alter table public.import_jobs enable row level security; alter table public.alerts enable row level security; alter table public.recommendations enable row level security;
alter table public.decisions enable row level security; alter table public.action_plans enable row level security; alter table public.scenarios enable row level security;
alter table public.audit_log enable row level security;

drop policy if exists org_read on public.organizations; create policy org_read on public.organizations for select using(id=public.current_org_id());
drop policy if exists profiles_org on public.profiles; create policy profiles_org on public.profiles for select using(organization_id=public.current_org_id());
drop policy if exists profiles_self_update on public.profiles; create policy profiles_self_update on public.profiles for update using(id=auth.uid()) with check(id=auth.uid());

do $$ declare t text; begin
  foreach t in array array['units','operations','leads','opportunities','activities','goals','costs','data_sources','import_jobs','alerts','recommendations','decisions','action_plans','scenarios'] loop
    execute format('drop policy if exists tenant_all on public.%I',t);
    execute format('create policy tenant_all on public.%I for all using (organization_id=public.current_org_id()) with check (organization_id=public.current_org_id())',t);
  end loop;
end $$;
drop policy if exists teams_tenant on public.teams; create policy teams_tenant on public.teams for all using(exists(select 1 from public.operations o where o.id=operation_id and o.organization_id=public.current_org_id())) with check(exists(select 1 from public.operations o where o.id=operation_id and o.organization_id=public.current_org_id()));
drop policy if exists agents_tenant on public.agents; create policy agents_tenant on public.agents for all using(exists(select 1 from public.teams t join public.operations o on o.id=t.operation_id where t.id=team_id and o.organization_id=public.current_org_id())) with check(exists(select 1 from public.teams t join public.operations o on o.id=t.operation_id where t.id=team_id and o.organization_id=public.current_org_id()));
drop policy if exists audit_read on public.audit_log; create policy audit_read on public.audit_log for select using(organization_id=public.current_org_id());

-- Views used by frontend
create or replace view public.opportunity_detail with (security_invoker = true) as
select op.*, coalesce(a.name,'—') owner, coalesce(t.name,'—') team,
  greatest(0, floor(extract(epoch from (now()-coalesce(op.last_activity_at,op.created_at)))/86400))::int aging_days
from public.opportunities op left join public.agents a on a.id=op.agent_id left join public.teams t on t.id=op.team_id;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant select on public.opportunity_detail to authenticated;
