create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;

create policy "Anyone can submit an enquiry"
on public.enquiries for insert
to anon
with check (char_length(name) > 1 and position('@' in email) > 1 and char_length(message) > 5);
