begin;

create table if not exists public.cs336_app_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cs336_app_members enable row level security;
revoke all on table public.cs336_app_members from anon, authenticated;
grant select on table public.cs336_app_members to authenticated;

drop policy if exists "cs336_member_reads_own_membership" on public.cs336_app_members;
create policy "cs336_member_reads_own_membership"
on public.cs336_app_members
for select
to authenticated
using ((select auth.uid()) = user_id);

create table if not exists public.cs336_learning_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint cs336_learning_state_is_object check (jsonb_typeof(state) = 'object'),
  constraint cs336_learning_state_size check (pg_column_size(state) <= 2097152),
  constraint cs336_learning_state_revision_positive check (revision > 0)
);

alter table public.cs336_learning_states enable row level security;
revoke all on table public.cs336_learning_states from anon, authenticated;
grant select on table public.cs336_learning_states to authenticated;
grant insert (user_id, state) on table public.cs336_learning_states to authenticated;
grant update (state) on table public.cs336_learning_states to authenticated;

drop policy if exists "cs336_member_reads_own_state" on public.cs336_learning_states;
create policy "cs336_member_reads_own_state"
on public.cs336_learning_states
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.cs336_app_members member
    where member.user_id = (select auth.uid()) and member.active
  )
);

drop policy if exists "cs336_member_creates_own_state" on public.cs336_learning_states;
create policy "cs336_member_creates_own_state"
on public.cs336_learning_states
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.cs336_app_members member
    where member.user_id = (select auth.uid()) and member.active
  )
);

drop policy if exists "cs336_member_updates_own_state" on public.cs336_learning_states;
create policy "cs336_member_updates_own_state"
on public.cs336_learning_states
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.cs336_app_members member
    where member.user_id = (select auth.uid()) and member.active
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.cs336_app_members member
    where member.user_id = (select auth.uid()) and member.active
  )
);

create or replace function public.touch_cs336_learning_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists cs336_learning_state_touch on public.cs336_learning_states;
create trigger cs336_learning_state_touch
before update on public.cs336_learning_states
for each row execute function public.touch_cs336_learning_state();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cs336-pdfs', 'cs336-pdfs', false, 20971520, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cs336_active_members_read_course_pdfs" on storage.objects;
create policy "cs336_active_members_read_course_pdfs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'cs336-pdfs'
  and exists (
    select 1 from public.cs336_app_members member
    where member.user_id = (select auth.uid()) and member.active
  )
);

commit;

-- Nach dem manuellen Anlegen des Auth-Benutzers einmalig ausführen:
-- insert into public.cs336_app_members (user_id) values ('UUID-DES-BENUTZERS');
