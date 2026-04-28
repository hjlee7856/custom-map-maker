create table if not exists public.places (
  id text primary key,
  name text not null,
  category text not null check (category in ('food', 'report', 'parking')),
  description text not null,
  address text not null,
  city text not null,
  status text not null check (status in ('published', 'pending')),
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

alter table public.places enable row level security;

revoke all on table public.places from anon, authenticated, public;
grant select on table public.places to anon, authenticated;
grant insert, update, delete on table public.places to authenticated;

drop policy if exists "public can read places" on public.places;
drop policy if exists "authenticated can insert places" on public.places;
drop policy if exists "authenticated can update places" on public.places;
drop policy if exists "authenticated can delete places" on public.places;

create policy "public can read places"
on public.places
for select
to anon, authenticated
using (true);

create policy "authenticated can insert places"
on public.places
for insert
to authenticated
with check (auth.uid() is not null);

create policy "authenticated can update places"
on public.places
for update
to authenticated
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "authenticated can delete places"
on public.places
for delete
to authenticated
using (auth.uid() is not null);

insert into public.places (id, name, category, description, address, city, status, latitude, longitude)
values
  ('place-1', '연남 샘플 맛집', 'food', '공개 지도에서 카테고리 필터와 상세 설명 흐름을 검증하기 위한 예시 장소입니다.', '서울 마포구 연남동', '서울', 'published', 37.562, 126.922),
  ('place-2', '서면 주정차 제보', 'report', '확인 대기 상태와 운영 검토 흐름을 보여주기 위한 샘플 제보입니다.', '부산 부산진구 서면로', '부산', 'pending', 35.1578, 129.0596),
  ('place-3', '성심당 인근 공영주차장', 'parking', '지도와 리스트를 오가며 주차 카테고리 흐름을 확인하기 위한 예시입니다.', '대전 중구 대종로', '대전', 'published', 36.3275, 127.4231),
  ('place-4', '애월 해안 맛집 제보', 'food', '수도권 밖 위치에서도 리스트와 지도 연동이 자연스럽게 동작하는지 확인하기 위한 샘플 데이터입니다.', '제주 제주시 애월읍', '제주', 'pending', 33.4621, 126.3111)
on conflict (id) do update
set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  address = excluded.address,
  city = excluded.city,
  status = excluded.status,
  latitude = excluded.latitude,
  longitude = excluded.longitude;
