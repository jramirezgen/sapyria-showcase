# Mantener activo el proyecto Supabase (plan gratuito)

Supabase pausa automáticamente los proyectos del plan gratuito tras **7 días**
sin actividad de API. `Sapyria_platform` está en ese plan, así que necesita un
mecanismo desatendido que genere actividad real con margen de sobra.

## Mecanismo: GitHub Actions, cada 3 días

`.github/workflows/keep-supabase-alive.yml` hace una petición `GET` al REST
de Supabase (PostgREST) cada 3 días — menos de la mitad del umbral de 7 días,
así que aunque una corrida se retrase o se salte, sigue sobrando margen.

- **Endpoint:** `${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`
- **Credencial usada:** la clave pública (`sb_publishable_...`), la misma que
  ya viaja al navegador de cualquier visitante de la web — no es secreta, y
  así lo documenta `.env.example` ("Browser-safe values").
- **Por qué `profiles` y no otra tabla:** ninguna tabla del esquema concede
  `SELECT` a `anon` (ver `supabase/003_esquema_demo.sql`,
  `supabase/004_perfil_de_exploracion.sql`, `supabase/005_leads_comerciales.sql`
  — todas restringen a `authenticated`/`service_role`). La respuesta esperada
  es **200 con lista vacía**: PostgREST sí ejecuta la consulta contra
  Postgres, RLS solo filtra las filas del resultado. Eso ya es el round-trip
  real que Supabase necesita ver para no pausar el proyecto, sin leer ni
  exponer ningún dato.
- **Disparo manual:** el workflow también acepta `workflow_dispatch`, para
  probarlo sin esperar al cron (pestaña **Actions** → *Keep Supabase Alive* →
  *Run workflow*).

## Configuración pendiente (una sola vez)

El workflow lee dos secrets del repositorio, que **no existen todavía** y hay
que darlos de alta a mano en GitHub — este repo no tiene `gh` CLI configurado
ni un token con permiso de administración de secrets disponible para hacerlo
por API, así que el paso queda para quien tenga acceso al repositorio:

1. GitHub → `jramirezgen/sapyria-showcase` → **Settings** → **Secrets and
   variables** → **Actions** → **New repository secret**.
2. Crear `SUPABASE_URL` con el mismo valor que `NEXT_PUBLIC_SUPABASE_URL` en
   Vercel (Production).
3. Crear `SUPABASE_ANON_KEY` con el mismo valor que
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en Vercel (Production).
4. Ejecutar manualmente el workflow (`workflow_dispatch`) una vez y confirmar
   en el log que el paso termina con `HTTP status: 200` y el mensaje final
   `OK: Supabase respondió ...`.
5. Confirmar en el dashboard de Supabase (Project → Reports, o la fecha de
   "last active") que la fecha de actividad se actualizó.

Aunque ambos valores son browser-safe (no son la `service_role key`), se
guardan como *secrets* de Actions y no en texto plano en el workflow, por
higiene y para no tener que tocar el archivo si algún día cambian.

## Nota sobre GitHub Actions y repos inactivos

GitHub **deshabilita automáticamente** los workflows programados (`schedule`)
si el repositorio pasa 60 días sin ningún commit. Si `sapyria-showcase` entra
en un periodo largo sin cambios, hay que volver a **Actions** → el workflow →
**Enable workflow** a mano; no hay forma de evitarlo desde el propio workflow.
