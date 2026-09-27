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
