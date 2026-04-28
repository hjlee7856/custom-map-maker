create table if not exists public.place_categories (
  id text primary key,
  label text not null unique,
  created_at timestamptz not null default now()
);

alter table public.place_categories enable row level security;

revoke all on table public.place_categories from anon, authenticated, public;
grant select on table public.place_categories to anon, authenticated;
grant insert, update, delete on table public.place_categories to authenticated;

drop policy if exists "public can read categories" on public.place_categories;
drop policy if exists "authenticated can manage categories" on public.place_categories;

create policy "public can read categories"
on public.place_categories
for select
to anon, authenticated
using (true);

create policy "authenticated can manage categories"
on public.place_categories
for all
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

insert into public.place_categories (id, label)
values
  ('food', '맛집'),
  ('report', '제보'),
  ('parking', '주차')
on conflict (id) do update
set label = excluded.label;

insert into public.place_categories (id, label)
select distinct places.category, places.category
from public.places as places
where not exists (
  select 1
  from public.place_categories as categories
  where categories.id = places.category
);

alter table public.places
drop constraint if exists places_category_check;

alter table public.places
drop constraint if exists places_category_fkey;

alter table public.places
add constraint places_category_fkey
foreign key (category) references public.place_categories (id);
