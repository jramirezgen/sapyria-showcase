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
