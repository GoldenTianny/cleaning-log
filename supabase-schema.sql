-- Supabase SQL Editor에서 한 번만 실행하세요.

-- 기본 체크리스트 (전역 설정, 1행만 사용)
create table if not exists settings (
  id int primary key default 1,
  default_checklist jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

insert into settings (id, default_checklist)
values (1, '["화장실", "진열대", "바닥", "음료냉장고"]'::jsonb)
on conflict (id) do nothing;

-- 날짜별 추가 요청
create table if not exists extra_requests (
  id bigserial primary key,
  request_date date not null unique,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 업로드된 사진 메타데이터
create table if not exists uploads (
  id bigserial primary key,
  upload_date date not null default current_date,
  item_label text not null,
  is_extra boolean not null default false,
  photo_path text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists uploads_date_idx on uploads (upload_date desc, created_at desc);

-- Storage 버킷 생성 (이미 있으면 무시)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- RLS: 시범 운영용 (로그인 없이 anon 키로 읽기/쓰기 허용)
alter table settings enable row level security;
alter table extra_requests enable row level security;
alter table uploads enable row level security;

drop policy if exists "anon all settings" on settings;
create policy "anon all settings" on settings for all using (true) with check (true);

drop policy if exists "anon all extra" on extra_requests;
create policy "anon all extra" on extra_requests for all using (true) with check (true);

drop policy if exists "anon all uploads" on uploads;
create policy "anon all uploads" on uploads for all using (true) with check (true);

-- Storage 정책: photos 버킷에 anon이 업로드/읽기 가능
drop policy if exists "anon read photos" on storage.objects;
create policy "anon read photos" on storage.objects for select using (bucket_id = 'photos');

drop policy if exists "anon insert photos" on storage.objects;
create policy "anon insert photos" on storage.objects for insert with check (bucket_id = 'photos');
