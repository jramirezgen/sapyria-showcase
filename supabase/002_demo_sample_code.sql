-- Los códigos de demostración dejan de parecerse a un caso clínico.
--
-- El esquema exigía `SPY-####-####`, que es EXACTAMENTE el formato de los casos
-- clínicos reales, y el aprovisionamiento generaba `SPY-2025-####`. Una muestra
-- sintética con el mismo formato que una real es indistinguible de una real en
-- cualquier captura, informe o conversación — y una de ellas llegó a publicarse
-- en la web.
--
-- `DEMO-####` no se puede confundir. La migración es en dos pasos porque la
-- restricción vieja rechazaría las filas nuevas y la nueva rechazaría las viejas.

alter table public.samples drop constraint if exists samples_sample_code_check;

update public.samples
   set sample_code = 'DEMO-' || right(sample_code, 4)
 where is_demo = true and sample_code like 'SPY-%';

alter table public.samples
  add constraint samples_sample_code_check
  check (sample_code ~ '^DEMO-[0-9]{4}$');

-- El aprovisionamiento, con el prefijo nuevo. Sigue siendo idempotente y sigue
-- dependiendo de `auth.uid()`: cada cuenta sólo puede crear la suya.
create or replace function public.claim_demo_sample()
returns void language plpgsql security definer set search_path = public as $$
declare
  suffix text;
begin
  if exists (select 1 from public.samples where user_id = auth.uid() and is_demo) then
    return;
  end if;
  suffix := lpad((floor(random() * 9000) + 1000)::int::text, 4, '0');
  insert into public.samples (user_id, sample_code, received_at, status, is_demo)
  values (auth.uid(), 'DEMO-' || suffix, now() - interval '10 days', 'ready', true);
end;
$$;
