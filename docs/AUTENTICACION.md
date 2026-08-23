# La cadena de acceso, y el fallo que la explica

> Escrito el 2026-08-22, después de que el correo de confirmación llevara a
> `http://localhost:3000/?code=c8e68fe2-…` y muriera en `ERR_CONNECTION_REFUSED`.

## Qué pasó, exactamente

El código de la web pedía lo correcto: `emailRedirectTo` apuntaba a
`https://www.sapyria.com/auth/callback`. Supabase entregó otra cosa —la **raíz**
de `localhost:3000`— y ahí está la lección:

> **Cuando el `redirect_to` que pides no está en la lista blanca, GoTrue no
> devuelve un error: lo descarta en silencio y cae al *Site URL*.**

Por eso el síntoma tenía dos pistas que juntas identifican la causa sin ambigüedad:

| Pista | Qué descarta |
| --- | --- |
| llegó a `/` y no a `/auth/callback` | no es la ruta de la app; la app pidió `/auth/callback` |
| llegó a `localhost:3000` | es el *Site URL* por defecto de un proyecto nuevo |

Un origen mal declarado no se manifiesta como un fallo en tu pantalla. Se
manifiesta como un enlace roto en el correo de otra persona.

## Lo que hay que dejar puesto en el panel de Supabase

**Authentication → URL Configuration.** Esto **no** se puede versionar en el
repo ni se puede tocar con la clave `sb_publishable_` ni con la `sb_secret_`:
requiere un token personal `sbp_…` del Management API. Es configuración de
consola, y por eso está escrita aquí.

**Site URL** — uno solo, y es el destino de reserva cuando algo falla:

```
https://www.sapyria.com
```

**Redirect URLs** — la lista blanca. Se acepta comodín:

```
https://www.sapyria.com/auth/callback
https://sapyria.com/auth/callback
https://*-sapyria.vercel.app/auth/callback     # los preestrenos de Vercel
http://localhost:3000/auth/callback            # sólo desarrollo
```

Google además exige, en su propia consola (**Credentials → OAuth client →
Authorized redirect URIs**), la URL de Supabase, **no** la de Sapyria:

```
https://iqhlksriyzrjzssejent.supabase.co/auth/v1/callback
```

## Lo que sí vive en el código

| Pieza | Qué garantiza |
| --- | --- |
| `lib/site.ts` | En producción se pide **siempre el mismo origen**, no el de la pestaña: la lista blanca tiene una entrada que mantener, no dos que se desincronizan. En `localhost` manda el origen real. |
| `app/auth/callback/route.ts` | Es el **único** punto de canje. Distingue enlace caducado, error del proveedor y configuración a medias — antes los tres acababan igual: en un `/login` mudo. |
| `proxy.ts` | La red de seguridad: un `?code=` que aterrice en **cualquier** ruta se reenvía al canje. Arreglar la lista blanca es la cura; esto es el cinturón. |
| `app/auth/signout/route.ts` | Cierra la sesión de verdad. El botón «Salir» era un enlace a `/login` y dejaba la sesión viva. |

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL              obligatoria
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  obligatoria — pública por diseño, viaja en el bundle
NEXT_PUBLIC_SITE_URL                  opcional; por defecto https://www.sapyria.com
```

## Las migraciones no son opcionales

`supabase/001_product_demo.sql` y luego `002_demo_sample_code.sql`. Mientras no
se apliquen, `claim_demo_sample()` no existe y el panel privado **degrada a la
muestra estática** en lugar de fallar — que es lo correcto, pero significa que
nadie se entera de que la base está vacía. Para comprobarlo sin abrir la consola:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/claim_demo_sample" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" -H 'Content-Type: application/json' -d '{}'
# 404 = la migración no está aplicada · 401 = está aplicada y RLS la protege
```

---

# Auditoría del registro — 2026-08-23

Motivo: el panel cargaba y mostraba `DEMO-0000`, y no estaba claro si detrás
había un usuario, un perfil y una muestra, o nada.

**Había nada.** `DEMO-0000` no lo genera la base: era el **valor de reserva** de
`lib/demo.ts`, que se pintaba cuando la consulta no devolvía nada. Un panel
completo, con su código de muestra y sus cuatro pasos en verde, sobre una base
de datos **sin una sola tabla**. Indistinguible de un éxito.

## Qué ocurría

| Comprobación | Resultado |
| --- | --- |
| `profiles`, `samples`, `demo_results`, `claim_demo_sample` | **404 las cuatro** — no existían |
| usuarios en `auth.users` | **1**, `provider: google`, `confirmation_sent_at: null` |
| usuarios con proveedor `email` | **0** — esa ruta no se había completado nunca |
| `mailer_autoconfirm` | `false` |

La cuenta que llegaba al panel se creó con **«Continuar con Google»**, que se
salta la confirmación porque Google ya validó la dirección. Por eso parecía que
el registro funcionaba: funcionaba *el de Google*.

## Qué debe ocurrir

```
/login → signUp(email,password) → GoTrue crea el usuario SIN sesión
       → correo de confirmación → /auth/callback canjea el código PKCE
       → trigger on_auth_user_created crea el perfil
       → claim_demo_sample() asigna una muestra DEMO-#### (nunca 0000)
       → /dashboard la muestra, o dice que no la hay
```

## Comprobado empíricamente contra producción

Registro real con una dirección de prueba, borrada al terminar:

| | |
| --- | --- |
| `signUp` | HTTP 200, **sin sesión** — correcto, exige confirmar |
| usuario | creado, `provider: email`, `full_name` del formulario guardado |
| `confirmation_sent_at` | **puesto** → GoTrue sí intentó enviar; el SMTP respondió |
| `email_confirmed_at` | vacío — correcto, aún sin confirmar |
| limpieza | usuario borrado, vuelta a 1 en `auth.users` |

> ⚠️ **Lo único que sigue sin verificar es que el correo LLEGUE.** El SMTP por
> defecto de Supabase está limitado a direcciones del equipo y a unos pocos
> envíos por hora. Para clientes reales hace falta SMTP propio; si no, el correo
> se acepta y se descarta sin que nadie se entere.

## Por qué la cadena `001 → 002` no podía aplicarse

1. `001` declara `claim_demo_sample() returns uuid`; `002` hace
   `create or replace … returns void`. PostgreSQL lo rechaza con
   **`42P13: cannot change return type of existing function`**. `002` fallaba
   siempre si `001` había corrido.
2. `001` sembraba en `demo_results` los puntajes `0.81 / 0.74 / 0.62` y el módulo
   **«Homeostasis neuronal»**, que no existe — los datos fabricados que ya se
   habían quitado de la web. `002` no los tocaba.

Ambas quedan marcadas como históricas. La buena es **`003_esquema_demo.sql`**:
consolidada, idempotente, sin `demo_results`, con el `check` `DEMO-####` desde el
principio, y con **relleno de perfiles** para las cuentas anteriores al trigger
—sin él, el usuario de Google queda huérfano y `claim_demo_sample()` le falla por
clave foránea—.

## ⛔ Bloqueo: no se pudo aplicar

La contraseña de base de datos del fichero de credenciales **no autentica**:

```
FATAL: password authentication failed for user "postgres"
```

Comprobado que el resto es correcto: el proyecto vive en **us-east-2** (lo dicen
dos vías independientes — el bloque IPv6 `2600:1f16::/34` en los rangos
publicados de AWS, y que `aws-0-us-east-2` es el único *pooler* que responde
«password authentication failed» en vez de «tenant not found»). La conexión
directa `db.<ref>.supabase.co` es **sólo IPv6** y desde WSL no hay ruta; el
*pooler* sí da IPv4, pero la contraseña es la que falla.

**La vía más rápida es pegar `003_esquema_demo.sql` en el SQL Editor de
Supabase**: son treinta segundos y no obliga a compartir ninguna credencial.

Para comprobar después, sin abrir la consola — **404 = sin aplicar · 401 =
aplicada y protegida por RLS**:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/claim_demo_sample" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
  -H 'Content-Type: application/json' -d '{}'
```
