create table if not exists public.academy_onboarding_links (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  slug text not null unique,
  is_active boolean not null default true,
  approval_mode text not null default 'automatic' check (approval_mode in ('automatic', 'manual')),
  title text,
  welcome_message text,
  created_by uuid,
  last_regenerated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academy_id)
);

create index if not exists idx_academy_onboarding_links_slug on public.academy_onboarding_links(slug);
create index if not exists idx_academy_onboarding_links_academy on public.academy_onboarding_links(academy_id);

create table if not exists public.academy_onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies(id) on delete cascade,
  link_id uuid references public.academy_onboarding_links(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  approved_membership_id uuid references public.memberships(id) on delete set null,
  email text not null,
  full_name text not null,
  phone text,
  desired_role text not null default 'student' check (desired_role in ('student', 'professor')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'auto_approved')),
  source text not null default 'public_link' check (source in ('public_link', 'qr', 'manual_admin', 'staff_invite')),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  requested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_academy_onboarding_requests_academy on public.academy_onboarding_requests(academy_id, status, desired_role);
create index if not exists idx_academy_onboarding_requests_email on public.academy_onboarding_requests(lower(email));

create unique index if not exists idx_academy_onboarding_requests_unique_open_request
  on public.academy_onboarding_requests (academy_id, lower(email), desired_role)
  where status = 'pending';

alter table public.academy_onboarding_links enable row level security;
alter table public.academy_onboarding_requests enable row level security;

drop policy if exists "academy_onboarding_links_select" on public.academy_onboarding_links;
create policy "academy_onboarding_links_select"
  on public.academy_onboarding_links
  for select
  using (
    academy_id = any(public.get_user_academy_ids())
  );

drop policy if exists "academy_onboarding_links_manage" on public.academy_onboarding_links;
create policy "academy_onboarding_links_manage"
  on public.academy_onboarding_links
  for all
  using (
    exists (
      select 1
      from public.memberships m
      where m.profile_id = auth.uid()
        and m.academy_id = academy_onboarding_links.academy_id
        and m.role in ('owner', 'admin')
        and m.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.memberships m
      where m.profile_id = auth.uid()
        and m.academy_id = academy_onboarding_links.academy_id
        and m.role in ('owner', 'admin')
        and m.status = 'active'
    )
  );

drop policy if exists "academy_onboarding_requests_select" on public.academy_onboarding_requests;
create policy "academy_onboarding_requests_select"
  on public.academy_onboarding_requests
  for select
  using (
    academy_id = any(public.get_user_academy_ids())
  );

drop policy if exists "academy_onboarding_requests_manage" on public.academy_onboarding_requests;
create policy "academy_onboarding_requests_manage"
  on public.academy_onboarding_requests
  for all
  using (
    exists (
      select 1
      from public.memberships m
      where m.profile_id = auth.uid()
        and m.academy_id = academy_onboarding_requests.academy_id
        and m.role in ('owner', 'admin')
        and m.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.memberships m
      where m.profile_id = auth.uid()
        and m.academy_id = academy_onboarding_requests.academy_id
        and m.role in ('owner', 'admin')
        and m.status = 'active'
    )
  );
