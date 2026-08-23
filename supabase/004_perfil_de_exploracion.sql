-- El perfil de exploración: la cuenta deja de tener una muestra sintética y pasa
-- a explorar una cohorte pública REAL, elegida por la persona al entrar.
--
-- ¿Por qué? Porque el panel gritaba «MUESTRA SINTÉTICA» en cada bloque, y con
-- razón: las cifras estaban inventadas y había que decirlo. Con datos reales no
-- hay nada que disimular — la procedencia se declara una vez, con dignidad, y el
-- momento de elegir se convierte en la entrada al producto.
--
-- Idempotente: puede correrse sobre una base que ya tenga 003 aplicada.

-- ── La lista blanca ──────────────────────────────────────────────────────────
-- Es una TABLA, no un `check` con ocho literales, por dos motivos: `samples`
-- puede referenciarla con clave foránea —así el navegador no puede escribir un
-- identificador arbitrario ni aunque se salte la función— y añadir una cohorte
-- nueva es un `insert`, no una migración.
create table if not exists public.perfiles_demo (
  id      text primary key,
  titulo  text not null,
  clase   text not null,
  orden   int  not null default 0
);

insert into public.perfiles_demo (id, titulo, clase, orden) values
  ('GSE228540', 'Sepsis',                        'infecciosa',        1),
  ('GSE144413', 'Malaria',                       'infecciosa',        2),
  ('GSE131174', 'Tuberculosis',                  'infecciosa',        3),
  ('GSE46579',  'Alzheimer',                     'neurodegenerativa', 4),
  ('GSE140069', 'Creutzfeldt-Jakob esporádica',  'neurodegenerativa', 5),
  ('GSE128079', 'Leucemia mieloide aguda',       'oncológica',        6),
  ('GSE97901',  'Cáncer de próstata',            'oncológica',        7),
  ('GSE115816', 'Rechazo de injerto renal',      'inmune',            8)
on conflict (id) do update
  set titulo = excluded.titulo, clase = excluded.clase, orden = excluded.orden;

-- ── La columna ───────────────────────────────────────────────────────────────
-- NULO significa «aún no ha elegido», y eso es lo que dispara la pantalla de
-- bienvenida. No es un hueco: es un estado con significado.
alter table public.samples add column if not exists perfil text;
do $$ begin
  alter table public.samples
    add constraint samples_perfil_fkey foreign key (perfil) references public.perfiles_demo(id);
exception when duplicate_object then null;
end $$;

-- ── Permisos ─────────────────────────────────────────────────────────────────
alter table public.perfiles_demo enable row level security;
drop policy if exists "cualquiera autenticado puede leer los perfiles" on public.perfiles_demo;
create policy "cualquiera autenticado puede leer los perfiles"
  on public.perfiles_demo for select to authenticated using (true);

grant select on public.perfiles_demo to authenticated, service_role;

-- Deliberadamente NO se concede `update` sobre `samples` a `authenticated`: la
-- elección se hace SÓLO a través de la función de abajo, que valida y sólo toca
-- la fila propia. El navegador nunca escribe directamente en sus datos.

-- ── Elegir perfil ────────────────────────────────────────────────────────────
create or replace function public.elegir_perfil(p_cohorte text) returns text
language plpgsql security definer set search_path = public as $$
declare
  actualizado text;
begin
  if auth.uid() is null then
    raise exception 'hace falta una sesión para elegir perfil';
  end if;
  -- La clave foránea ya lo impediría, pero un mensaje claro vale más que un
  -- error de integridad subiendo hasta la interfaz.
  if not exists (select 1 from public.perfiles_demo where id = p_cohorte) then
    raise exception 'perfil no reconocido: %', p_cohorte;
  end if;
  update public.samples
     set perfil = p_cohorte
   where user_id = auth.uid() and is_demo = true
   returning perfil into actualizado;
  return actualizado;
end;
$$;

grant execute on function public.elegir_perfil(text) to authenticated;

-- ── Comprobación ─────────────────────────────────────────────────────────────
select 'tabla perfiles_demo'  as comprueba, to_regclass('public.perfiles_demo') is not null as ok
union all select 'ocho perfiles sembrados',   (select count(*) = 8 from public.perfiles_demo)
union all select 'columna samples.perfil',    exists(select 1 from information_schema.columns
                                                     where table_name = 'samples' and column_name = 'perfil')
union all select 'funcion elegir_perfil',     to_regprocedure('public.elegir_perfil(text)') is not null
union all select 'authenticated lee perfiles',has_table_privilege('authenticated', 'public.perfiles_demo', 'SELECT');
