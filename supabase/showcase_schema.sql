-- Aplicar sólo en el proyecto Supabase de showcase, nunca en un entorno clínico.
create table if not exists public.showcase_cases (
  id text primary key,
  title text not null,
  assay text not null check (assay in ('small_rna_seq', 'wes', 'wgs')),
  status text not null,
  summary text not null,
  signal text not null,
  evidence text not null,
  metric_label text not null,
  metric_value text not null,
  metric_detail text not null,
  stage integer not null check (stage between 1 and 4),
  updated_at timestamptz not null default now(),
  is_public_demo boolean not null default false
);

alter table public.showcase_cases enable row level security;

create policy "anonymous users can read public showcase rows"
on public.showcase_cases for select
to anon
using (is_public_demo = true);

-- El alta/edición se realiza desde el SQL editor o un backend administrativo;
-- no se concede INSERT/UPDATE/DELETE al navegador.
