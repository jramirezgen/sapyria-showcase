-- Sapyria product demo only. This schema stores account and summary-level
-- information; it must never receive FASTQ, BAM, CRAM or full VCF artifacts.
create type public.sample_status as enum ('received', 'processing', 'analysis', 'ready');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sample_code text not null unique check (sample_code ~ '^SPY-[0-9]{4}-[0-9]{4}$'),
  received_at timestamptz not null default now(),
  status public.sample_status not null default 'received',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.demo_results (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null unique references public.samples(id) on delete cascade,
  phenotype_summary text not null,
  cellular_composition jsonb not null default '[]'::jsonb,
  regulatory_state jsonb not null default '{}'::jsonb,
  molecular_modules jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  limitations text[] not null default '{}',
  reported_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.samples enable row level security;
alter table public.demo_results enable row level security;

create policy "users can read their own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "users can update their own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "users can read their own samples" on public.samples for select to authenticated using (user_id = auth.uid());
create policy "users can read their own demo results" on public.demo_results for select to authenticated using (exists (select 1 from public.samples s where s.id = sample_id and s.user_id = auth.uid()));

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Each authenticated account receives an isolated synthetic sample. No browser
-- INSERT privilege is granted on the tables; the function only emits fixed demo
-- content tied to the calling auth.uid().
create function public.claim_demo_sample() returns uuid language plpgsql security definer set search_path = public as $$
declare
  existing_sample uuid;
  created_sample uuid;
  suffix text;
begin
  select id into existing_sample from public.samples where user_id = auth.uid() and is_demo = true limit 1;
  if existing_sample is not null then return existing_sample; end if;
  suffix := lpad((abs(hashtext(auth.uid()::text)) % 10000)::text, 4, '0');
  insert into public.samples (user_id, sample_code, received_at, status, is_demo)
  values (auth.uid(), 'SPY-2025-' || suffix, now() - interval '10 days', 'ready', true)
  returning id into created_sample;
  insert into public.demo_results (sample_id, phenotype_summary, cellular_composition, regulatory_state, molecular_modules, evidence, limitations)
  values (
    created_sample,
    'Fenotipo molecular inferido compatible con una señal regulatoria que merece exploración dirigida.',
    '[{"name":"Señal mieloide","status":"En rango de referencia","tone":"stable"},{"name":"Actividad inflamatoria","status":"Moderada","tone":"watch"},{"name":"Balance adaptativo","status":"Conservado","tone":"stable"}]'::jsonb,
    '{"title":"Señal coordinada","description":"Patrón demostrativo compatible con actividad regulatoria que merece exploración contextual."}'::jsonb,
    '[{"name":"Regulación post-transcripcional","state":"Señal coordinada","score":0.81},{"name":"Respuesta inmune innata","state":"Evidencia disponible","score":0.74},{"name":"Homeostasis neuronal","state":"Hipótesis para explorar","score":0.62}]'::jsonb,
    '[{"kind":"señal observada","description":"Patrón molecular de demostración."},{"kind":"hipótesis","description":"Lectura derivada que necesita contexto adicional."}]'::jsonb,
    array['Demo de producto; no contiene datos clínicos reales.', 'No es diagnóstico, pronóstico ni recomendación clínica.', 'Los datos primarios permanecen fuera de Supabase.']
  );
  return created_sample;
end;
$$;

grant execute on function public.claim_demo_sample() to authenticated;
