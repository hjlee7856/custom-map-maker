create index if not exists places_category_idx on public.places (category);

drop policy if exists "public can read categories" on public.place_categories;
create policy "public can read categories"
on public.place_categories
for select
to anon
using (true);

drop policy if exists "authenticated can manage categories" on public.place_categories;
create policy "authenticated can manage categories"
on public.place_categories
for all
to authenticated
using ((select auth.uid()) is not null)
with check ((select auth.uid()) is not null);

drop policy if exists "authenticated can insert places" on public.places;
create policy "authenticated can insert places"
on public.places
for insert
to authenticated
with check ((select auth.uid()) is not null);

drop policy if exists "authenticated can update places" on public.places;
create policy "authenticated can update places"
on public.places
for update
to authenticated
using ((select auth.uid()) is not null)
with check ((select auth.uid()) is not null);

drop policy if exists "authenticated can delete places" on public.places;
create policy "authenticated can delete places"
on public.places
for delete
to authenticated
using ((select auth.uid()) is not null);
