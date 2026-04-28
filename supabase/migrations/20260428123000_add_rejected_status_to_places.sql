alter table public.places
drop constraint if exists places_status_check;

alter table public.places
add constraint places_status_check
check (status in ('published', 'pending', 'rejected'));
