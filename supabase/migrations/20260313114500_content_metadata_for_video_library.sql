alter table if exists public.content
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_content_metadata_gin
  on public.content
  using gin (metadata);
