-- Captura comercial de sapyria.com.
-- Datos de contacto solamente: este esquema no admite datos clínicos, genéticos
-- ni archivos. Se ejecuta después de 003_esquema_demo.sql.

create table if not exists public.commercial_owners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create unique index if not exists commercial_owners_name_unique on public.commercial_owners (name);

insert into public.commercial_owners (name, sort_order)
values ('Vilma', 10)
on conflict (name) do nothing;

create table if not exists public.commercial_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 2 and 160),
  email text not null check (char_length(email) between 5 and 254),
  phone text not null check (char_length(phone) between 4 and 40),
  city text not null check (char_length(city) between 1 and 100),
  country text not null check (char_length(country) between 1 and 100),
  interested_type text not null check (interested_type in ('Persona', 'Profesional de salud', 'Clínica o institución', 'Investigador/a', 'Empresa o alianza')),
  reason text not null check (char_length(reason) between 2 and 240),
  service_interest text check (service_interest is null or service_interest in ('Conocer la plataforma Sapyria', 'Fenotipo molecular personal', 'small RNA-seq', 'WES / WGS futuro', 'Investigación o datos públicos', 'Alianza institucional')),
  contact_preference text not null check (contact_preference in ('WhatsApp', 'Email', 'Teléfono')),
  message text check (message is null or char_length(message) <= 2000),
  privacy_consent boolean not null check (privacy_consent),
  source text not null default 'website' check (source = 'website'),
  origin_page text not null default '/contacto' check (origin_page like '/%'),
  status text not null default 'Nuevo' check (status in ('Nuevo', 'Contactado', 'Calificado', 'En seguimiento', 'Cerrado', 'Descartado')),
  owner_id uuid references public.commercial_owners(id),
  last_interaction_at timestamptz,
  internal_notes text,
  constraint commercial_leads_no_files check (message is null or message !~* '(fastq|\.bam|\.vcf|archivo adjunto)')
);

create index if not exists commercial_leads_created_at_idx on public.commercial_leads (created_at desc);
create index if not exists commercial_leads_status_idx on public.commercial_leads (status, created_at desc);

create table if not exists public.lead_notification_events (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.commercial_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  channel text not null check (channel in ('email')),
  status text not null check (status in ('sent', 'skipped', 'error')),
  detail text check (detail is null or char_length(detail) <= 500)
);

alter table public.commercial_owners enable row level security;
alter table public.commercial_leads enable row level security;
alter table public.lead_notification_events enable row level security;

-- Ningún visitante puede listar, actualizar ni borrar contactos. La única puerta
-- pública es la función siguiente, que fija los campos internos en el servidor.
revoke all on table public.commercial_owners, public.commercial_leads, public.lead_notification_events from anon, authenticated;

-- `service_role` NO recibe privilegios por defecto en este proyecto — medido en
-- 003_esquema_demo.sql (líneas 78-86): sin este GRANT explícito, cada llamada de
-- `saveNotification()` (app/api/contacto/route.ts), que autentica como
-- `service_role` para registrar el estado del aviso por correo, falla con
-- `42501 permission denied for table lead_notification_events` y el evento de
-- auditoría se pierde en silencio (el `!response.ok` sólo hace un
-- `console.error`). `select` en las tres tablas es además lo mínimo para que una
-- herramienta de soporte o auditoría del lado servidor pueda leerlas.
grant select on public.commercial_owners to service_role;
grant select, insert on public.commercial_leads to service_role;
grant select, insert on public.lead_notification_events to service_role;

create or replace function public.create_commercial_lead(
  p_full_name text,
  p_email text,
  p_phone text,
  p_city text,
  p_country text,
  p_interested_type text,
  p_reason text,
  p_service_interest text default null,
  p_contact_preference text default null,
  p_message text default null,
  p_origin_page text default '/contacto'
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  lead_id uuid;
  assigned_owner uuid;
begin
  if char_length(trim(coalesce(p_full_name, ''))) not between 2 and 160
     or char_length(trim(coalesce(p_email, ''))) not between 5 and 254
     or char_length(trim(coalesce(p_phone, ''))) not between 4 and 40
     or char_length(trim(coalesce(p_city, ''))) not between 1 and 100
     or char_length(trim(coalesce(p_country, ''))) not between 1 and 100
     or char_length(trim(coalesce(p_reason, ''))) not between 2 and 240
     or p_interested_type not in ('Persona', 'Profesional de salud', 'Clínica o institución', 'Investigador/a', 'Empresa o alianza')
     or p_contact_preference not in ('WhatsApp', 'Email', 'Teléfono')
     or (p_service_interest is not null and p_service_interest <> '' and p_service_interest not in ('Conocer la plataforma Sapyria', 'Fenotipo molecular personal', 'small RNA-seq', 'WES / WGS futuro', 'Investigación o datos públicos', 'Alianza institucional'))
     or char_length(coalesce(p_message, '')) > 2000 then
    raise exception 'invalid commercial lead';
  end if;

  select id into assigned_owner from public.commercial_owners where active order by sort_order, created_at limit 1;

  insert into public.commercial_leads (
    full_name, email, phone, city, country, interested_type, reason,
    service_interest, contact_preference, message, privacy_consent, source,
    origin_page, owner_id
  ) values (
    trim(p_full_name), lower(trim(p_email)), trim(p_phone), trim(p_city), trim(p_country),
    p_interested_type, trim(p_reason), nullif(trim(p_service_interest), ''),
    p_contact_preference, nullif(trim(p_message), ''), true, 'website',
    case when left(coalesce(p_origin_page, ''), 1) = '/' then left(p_origin_page, 200) else '/contacto' end,
    assigned_owner
  ) returning id into lead_id;

  return lead_id;
end;
$$;

revoke all on function public.create_commercial_lead(text, text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.create_commercial_lead(text, text, text, text, text, text, text, text, text, text, text) to anon, authenticated;
