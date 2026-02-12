-- Migration: hide non-theatre rows without deleting
-- Safe to run multiple times.

alter table public.representations
  add column if not exists is_theatre boolean not null default true,
  add column if not exists hidden_reason text,
  add column if not exists hidden_at timestamptz;

create index if not exists representations_is_theatre_idx
  on public.representations(is_theatre);

-- OPTIONAL: if you want public SELECT to only return theatre rows, use this policy.
-- WARNING: run only if you are comfortable changing existing policies.
--
-- drop policy if exists "Lecture publique des representations" on public.representations;
-- create policy "Lecture publique des representations (theatre only)"
-- on public.representations for select
-- to anon, authenticated
-- using (is_theatre = true);
