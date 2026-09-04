# Mantener activo el proyecto Supabase (plan gratuito)

Supabase pausa automáticamente los proyectos del plan gratuito tras **7 días**
sin actividad de API. `Sapyria_platform` está en ese plan, así que necesita un
mecanismo desatendido que genere actividad real con margen de sobra.

## Mecanismo: GitHub Actions, cada 3 días

`.github/workflows/keep-supabase-alive.yml` hace una petición `GET` cada 3
días — menos de la mitad del umbral de 7 días, así que aunque una corrida se
retrase o se salte, sigue sobrando margen.

- **Endpoint:** `${SUPABASE_URL}/auth/v1/health` (GoTrue, no PostgREST).
- **Credencial usada:** la clave pública (`sb_publishable_...`), la misma que
  ya viaja al navegador de cualquier visitante de la web — no es secreta, y
  así lo documenta `.env.example` ("Browser-safe values"). El endpoint exige
  el header `apikey` aunque no lea ninguna tabla (probado: sin `apikey` da
  `401`).
- **Por qué `/auth/v1/health` y no una tabla vía PostgREST:** se probó primero
  contra `/rest/v1/profiles?select=id&limit=1` con la clave pública y devolvió
  **401** `permission denied for table profiles` — no es RLS filtrando filas,
  es que **ninguna** tabla del esquema concede `GRANT SELECT` a `anon` (ver
  `supabase/003_esquema_demo.sql`, `supabase/004_perfil_de_exploracion.sql` y
  `supabase/005_leads_comerciales.sql`: todas restringen a
  `authenticated`/`service_role`). RLS y GRANT son compuertas distintas y la
  segunda bloquea antes de que la primera actúe. `/auth/v1/health` sí pasa
  por el mismo Postgres del proyecto (GoTrue vive en el esquema `auth` de esa
  misma base) pero no depende de permisos de tabla — responde 200 siempre y
  es la señal de actividad más limpia sin tocar ni exponer datos de negocio.
- **Disparo manual:** el workflow también acepta `workflow_dispatch`, para
  probarlo sin esperar al cron (pestaña **Actions** → *Keep Supabase Alive* →
  *Run workflow*).

## Secrets del repositorio

El workflow lee `SUPABASE_URL` y `SUPABASE_ANON_KEY` como *repository
secrets* de Actions (Settings → Secrets and variables → Actions). Ambos
valores son los mismos `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` que ya están configurados en Vercel —
son browser-safe (no son la `service_role key`), pero se guardan como
*secrets* y no en texto plano en el workflow por higiene y para no tocar el
archivo si algún día cambian.

Dados de alta el 2026-09-03 vía API de GitHub (`PUT
/repos/jramirezgen/sapyria-showcase/actions/secrets/{name}`, valor cifrado
con la clave pública del repo mediante `PyNaCl`/`libsodium` antes de
enviarlo — nunca viajó en texto plano). Si hay que rotarlos, mismo mecanismo
o a mano desde la UI de GitHub.

## Verificación

Corrida manual (`workflow_dispatch`) disparada el 2026-09-03 tras dar de alta
los secrets — ver la pestaña **Actions** del repositorio para el log
completo y la fecha de la corrida real. Antes de tocar Actions se verificó el
mismo request directamente contra el proyecto en producción
(`https://iqhlksriyzrjzssejent.supabase.co`), con resultado `200 OK` y cuerpo
`{"version":"...","name":"GoTrue",...}`.

## Nota sobre GitHub Actions y repos inactivos

GitHub **deshabilita automáticamente** los workflows programados (`schedule`)
si el repositorio pasa 60 días sin ningún commit. Si `sapyria-showcase` entra
en un periodo largo sin cambios, hay que volver a **Actions** → el workflow →
**Enable workflow** a mano; no hay forma de evitarlo desde el propio workflow.
