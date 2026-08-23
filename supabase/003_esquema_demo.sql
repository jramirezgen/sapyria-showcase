-- Esquema del espacio privado de demostración. Sustituye a 001 + 002.
--
-- ¿Por qué una tercera y no aplicar las dos que había? Porque la cadena
-- documentada NO SE PODÍA APLICAR, y además devolvía un defecto ya corregido:
--
--   1. `001` declara `claim_demo_sample() returns uuid` y `002` hace
--      `create or replace … returns void`. PostgreSQL rechaza eso con
--      `42P13: cannot change return type of existing function`. La segunda
--      migración fallaba SIEMPRE si la primera había corrido.
--   2. `001` sembraba en `demo_results` los puntajes `0.81 / 0.74 / 0.62` y el
--      módulo «Homeostasis neuronal», que no existe en el sistema. Son
--      exactamente los datos fabricados que se quitaron de la web; `002` sólo
--      arreglaba el código de muestra. Aplicarlas devolvía el problema por la
--      puerta de atrás.
--
-- Aquí NO se crea `demo_results`: la web sólo consulta `samples` y llama a la
-- función. Era peso muerto, y el peso que cargaba era inventado.
--
-- Este fichero es idempotente: puede correrse sobre una base vacía o sobre una
-- donde 001/002 dejaran algo a medias.
--
-- ⚠️ Nada de lo que vive aquí es dato ómico primario. Esta base guarda cuentas y
-- resúmenes; nunca FASTQ, BAM, CRAM ni VCF.

-- ── Tipos ────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.sample_status as enum ('received', 'processing', 'analysis', 'ready');
exception when duplicate_object then null;
end $$;

-- ── Tablas ───────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

-- El `check` nace ya como DEMO-####. En `001` era `SPY-####-####`, que es el
-- formato de los casos clínicos REALES: una muestra sintética indistinguible de
-- una real en cualquier captura o conversación. Aquí ese formato no llega a
-- existir ni un instante.
create table if not exists public.samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sample_code text not null unique,
  received_at timestamptz not null default now(),
  status public.sample_status not null default 'received',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.samples drop constraint if exists samples_sample_code_check;
update public.samples set sample_code = 'DEMO-' || right(sample_code, 4)
 where sample_code !~ '^DEMO-[0-9]{4}$';
alter table public.samples
  add constraint samples_sample_code_check check (sample_code ~ '^DEMO-[0-9]{4}$');

-- ── Aislamiento por fila ─────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.samples  enable row level security;

drop policy if exists "users can read their own profile"   on public.profiles;
drop policy if exists "users can update their own profile" on public.profiles;
drop policy if exists "users can read their own samples"   on public.samples;

create policy "users can read their own profile"
  on public.profiles for select to authenticated using (id = auth.uid());
create policy "users can update their own profile"
  on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "users can read their own samples"
  on public.samples for select to authenticated using (user_id = auth.uid());

-- ── Privilegios de tabla ─────────────────────────────────────────────────────
-- RLS y GRANT son DOS compuertas distintas y hay que pasar las dos: una política
-- que te autoriza no sirve de nada si el rol no tiene permiso sobre la tabla.
--
-- Medido el 2026-08-23: Supabase ya concede lo suyo a `authenticated` por
-- privilegios por defecto —el camino del usuario funciona—, pero **`service_role`
-- se queda fuera**: `42501 permission denied for table profiles`. Eso no afecta a
-- la web, que nunca usa la clave de servicio, pero deja ciega cualquier
-- herramienta de auditoría o soporte del lado servidor.
--
-- Se declaran explícitamente los tres roles en vez de confiar en los privilegios
-- por defecto: dependen de qué rol creó la tabla, y eso cambia según se aplique
-- por el SQL Editor, por la CLI o por una conexión directa.
grant usage on schema public to anon, authenticated, service_role;

grant select on public.profiles to authenticated, service_role;
grant update on public.profiles to authenticated;              -- hay política de UPDATE
grant select on public.samples  to authenticated, service_role;

-- Deliberadamente NO se concede insert/update/delete sobre `samples` a nadie que
-- venga del navegador. La muestra nace ÚNICAMENTE dentro de la función
-- `security definer`, atada a `auth.uid()`: es lo que impide que un cliente se
-- fabrique muestras o toque las de otro. Esa frontera no se relaja.

-- ── El perfil se crea con la cuenta ──────────────────────────────────────────
-- `full_name` viene del formulario; con Google llega como `name`. Se aceptan los
-- dos porque los dos proveedores están activos.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id,
          coalesce(new.email, ''),
          coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

-- Relleno de las cuentas que ya existían ANTES de que hubiera trigger.
--
-- Sin esto, quien se registró antes queda sin perfil, y como
-- `samples.user_id` referencia `profiles(id)`, `claim_demo_sample()` le falla
-- con una violación de clave foránea: entra al panel y nunca recibe muestra.
insert into public.profiles (id, email, full_name)
select u.id,
       coalesce(u.email, ''),
       coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name')
  from auth.users u
 on conflict (id) do nothing;

-- ── Aprovisionamiento de la muestra sintética ────────────────────────────────
-- UNA sola definición. El `drop` previo evita para siempre el conflicto de tipo
-- de retorno que hacía imposible aplicar 002 sobre 001.
--
-- `security definer` + `auth.uid()`: el navegador no tiene permiso de INSERT
-- sobre las tablas; sólo puede pedir la suya, y sólo una vez.
drop function if exists public.claim_demo_sample();

create function public.claim_demo_sample() returns uuid
language plpgsql security definer set search_path = public as $$
declare
  existente uuid;
  creada    uuid;
  sufijo    text;
  intento   int := 0;
begin
  select id into existente from public.samples
   where user_id = auth.uid() and is_demo = true limit 1;
  if existente is not null then return existente; end if;

  -- El sufijo deriva del uid, así que es estable si hay que reintentar; el bucle
  -- cubre la colisión entre dos uid distintos, que es rara pero no imposible.
  loop
    intento := intento + 1;
    sufijo := lpad(((abs(hashtext(auth.uid()::text || intento::text)) % 9000) + 1000)::text, 4, '0');
    begin
      insert into public.samples (user_id, sample_code, received_at, status, is_demo)
      values (auth.uid(), 'DEMO-' || sufijo, now() - interval '10 days', 'ready', true)
      returning id into creada;
      return creada;
    exception when unique_violation then
      if intento >= 10 then raise; end if;
    end;
  end loop;
end;
$$;

grant execute on function public.claim_demo_sample() to authenticated;

-- ── Comprobación ─────────────────────────────────────────────────────────────
-- Las cinco filas deben decir `true`. Si alguna sale `false`, algo no se aplicó.
select 'tabla profiles'        as comprueba, to_regclass('public.profiles')            is not null as ok
union all select 'tabla samples',            to_regclass('public.samples')             is not null
union all select 'funcion claim_demo_sample',to_regprocedure('public.claim_demo_sample()') is not null
union all select 'trigger de perfil',        exists(select 1 from pg_trigger where tgname = 'on_auth_user_created')
union all select 'authenticated puede leer samples',
                 has_table_privilege('authenticated', 'public.samples', 'SELECT');
