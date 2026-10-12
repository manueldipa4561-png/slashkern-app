-- KERN accounts + sync. Run once in Supabase: Dashboard > SQL Editor > New query > paste > Run.
-- One row per user holding their trail as JSON. Row Level Security makes every row private to its owner.

create table if not exists public.kern_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now(),
  constraint kern_state_size check (pg_column_size(state) < 500000)
);

alter table public.kern_state enable row level security;

drop policy if exists "own row: read"   on public.kern_state;
drop policy if exists "own row: insert" on public.kern_state;
drop policy if exists "own row: update" on public.kern_state;
drop policy if exists "own row: delete" on public.kern_state;

create policy "own row: read"   on public.kern_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "own row: insert" on public.kern_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own row: update" on public.kern_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own row: delete" on public.kern_state for delete to authenticated using ((select auth.uid()) = user_id);

-- Lets a signed-in user delete their own account (and, by cascade, their trail). Nobody else's.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Signs on the trail: the short tip someone leaves after a mission, shown without a name to the next
-- people who open the same mission. Anyone can read visible signs (only the columns granted below, never
-- who wrote them). Writing goes only through add_sign / delete_my_sign, which act for auth.uid().
create table if not exists public.kern_signs (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  field      text not null check (field in ('Design', 'Writing', 'Code', 'Video', 'Selling', 'Music', 'Prompting')),
  mission    smallint not null check (mission between 0 and 5),
  tip        text not null check (char_length(tip) between 3 and 140 and tip !~* '(https?://|www\.|@|[0-9]{6,})'),
  created_at timestamptz not null default now(),
  hidden     boolean not null default false
);
-- Round 2 adds missions 3 to 5. Widens the limit on a table created before it (safe to repeat).
alter table public.kern_signs drop constraint if exists kern_signs_mission_check;
alter table public.kern_signs add constraint kern_signs_mission_check check (mission between 0 and 5);
-- A new field is added here too, so a table made earlier is widened when this script runs again.
alter table public.kern_signs drop constraint if exists kern_signs_field_check;
alter table public.kern_signs add constraint kern_signs_field_check check (field in ('Design', 'Writing', 'Code', 'Video', 'Selling', 'Music', 'Prompting'));
create index if not exists kern_signs_trail on public.kern_signs (field, mission, created_at desc);
alter table public.kern_signs enable row level security;

revoke all on public.kern_signs from anon, authenticated;
grant select (id, field, mission, tip, created_at, hidden) on public.kern_signs to anon, authenticated;
drop policy if exists "signs: read visible" on public.kern_signs;
create policy "signs: read visible" on public.kern_signs for select to anon, authenticated using (not hidden);

-- Adds a sign for the signed-in user; at most 20 a day each, so the trail cannot be flooded.
create or replace function public.add_sign(p_field text, p_mission smallint, p_tip text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare new_id bigint;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0)); -- one add at a time per user, so the cap holds
  if (select count(*) from public.kern_signs where user_id = auth.uid() and created_at > now() - interval '1 day') >= 20 then
    raise exception 'too many signs today';
  end if;
  insert into public.kern_signs (user_id, field, mission, tip) values (auth.uid(), p_field, p_mission, btrim(p_tip)) returning id into new_id;
  return new_id;
end;
$$;

-- Removes one of the signed-in user's own signs. Nobody else's.
create or replace function public.delete_my_sign(sign_id bigint)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.kern_signs where id = sign_id and user_id = auth.uid();
$$;

revoke all on function public.add_sign(text, smallint, text) from public, anon;
revoke all on function public.delete_my_sign(bigint) from public, anon;
grant execute on function public.add_sign(text, smallint, text) to authenticated;
grant execute on function public.delete_my_sign(bigint) to authenticated;

-- Usage counts without names. Only people who said yes in the app are counted (see /privacy). A row is a random id the
-- device made when they said yes (never an account id), what happened and when: no name, email or text they wrote.
-- Nobody can read or write the table directly, signed in or not. log_event and forget_events below are the only way in;
-- the report (scripts/stats.mjs) reads it with the service key, which stays on your own computer.
create table if not exists public.kern_events (
  id         bigint generated always as identity primary key,
  aid        uuid not null,
  ev         text not null,
  field      text,
  mission    smallint,
  brand      boolean not null default false,
  lang       text,
  created_at timestamptz not null default now()
);
-- The lists that grow (a new event, a new field, a new round, a new language) are named constraints that this script replaces on every run,
-- so running it again after an update also updates a table made earlier. mission: same limit as kern_signs.
alter table public.kern_events drop constraint if exists kern_events_ev_check;
alter table public.kern_events add constraint kern_events_ev_check check (ev in ('optin', 'visit', 'open', 'answer', 'reflect', 'share', 'ask_ai'));
alter table public.kern_events drop constraint if exists kern_events_field_check;
alter table public.kern_events add constraint kern_events_field_check check (field in ('Design', 'Writing', 'Code', 'Video', 'Selling', 'Music', 'Prompting'));
alter table public.kern_events drop constraint if exists kern_events_mission_check;
alter table public.kern_events add constraint kern_events_mission_check check (mission between 0 and 5);
alter table public.kern_events drop constraint if exists kern_events_lang_check; -- the inline check of earlier versions had this name too
alter table public.kern_events add constraint kern_events_lang_check check (lang in ('en', 'it', 'de', 'fr', 'nl', 'sv'));
create index if not exists kern_events_aid on public.kern_events (aid, created_at);
create index if not exists kern_events_time on public.kern_events (created_at);
alter table public.kern_events enable row level security;
revoke all on public.kern_events from anon, authenticated;
grant select, delete on public.kern_events to service_role; -- the report reads it and you can clean it, even if default grants are off

-- Adds one event. The checks above reject anything that is not a known event; at most 300 a day per id.
-- The endpoint is public, so one hourly cap for everyone also stops a script filling the database with made-up ids.
-- ponytail: 2000 an hour is far above a pilot (a script could still add about 50000 rows a day, roughly 10 MB); raise it if a launch needs more.
-- Rows older than 12 months are removed 500 at a time on 1 in 100 calls, so a quiet app keeps some. For a guaranteed daily
-- clean-up enable pg_cron (Database, Extensions) and run once:
--   select cron.schedule('kern_events_12_months', '17 3 * * *', $$delete from public.kern_events where created_at < now() - interval '12 months'$$);
create or replace function public.log_event(p_aid uuid, p_ev text, p_field text default null, p_mission smallint default null, p_brand boolean default false, p_lang text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_aid::text, 1)); -- one add at a time per id, so the daily cap holds
  if (select count(*) from public.kern_events where aid = p_aid and created_at > now() - interval '1 day') >= 300 then raise exception 'too many events today'; end if;
  if (select count(*) from public.kern_events where created_at > now() - interval '1 hour') >= 2000 then raise exception 'busy, try later'; end if;
  insert into public.kern_events (aid, ev, field, mission, brand, lang) values (p_aid, p_ev, p_field, p_mission, coalesce(p_brand, false), p_lang);
  if random() < 0.01 then delete from public.kern_events where id in (select id from public.kern_events where created_at < now() - interval '12 months' limit 500); end if;
end;
$$;

-- Removes everything logged under one id (turning counts off, or Delete my data). The id is a random secret held only by that device.
create or replace function public.forget_events(p_aid uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.kern_events where aid = p_aid;
$$;

revoke all on function public.log_event(uuid, text, text, smallint, boolean, text) from public;
revoke all on function public.forget_events(uuid) from public;
grant execute on function public.log_event(uuid, text, text, smallint, boolean, text) to anon, authenticated;
grant execute on function public.forget_events(uuid) to anon, authenticated;
