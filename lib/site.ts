/**
 * El origen canónico del sitio, y el que se le pide a Supabase para volver.
 *
 * Existe por un fallo real del 2026-08-22: el correo de confirmación llevaba a
 * `http://localhost:3000/?code=…` y moría en `ERR_CONNECTION_REFUSED`. La causa
 * no estaba en este archivo —era el *Site URL* del panel de Supabase— pero el
 * remedio sí conviene que viva aquí, porque explica la regla:
 *
 * > cuando el `redirect_to` que pedimos **no está en la lista blanca**, GoTrue no
 * > falla: lo descarta en silencio y cae al *Site URL*. Un origen mal declarado
 * > no da error, da un enlace roto en el correo de otra persona.
 *
 * De ahí que en producción se pida **siempre el mismo origen** en vez del que
 * tenga la pestaña: así la lista blanca tiene una entrada que mantener, no dos
 * que se desincronizan. En desarrollo manda el origen real, para que `localhost`
 * siga funcionando sin tocar nada.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.sapyria.com").replace(/\/+$/, "");

function esOrigenLocal(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
}

/** El origen al que Supabase debe devolver al usuario tras confirmar o autorizar. */
export function origenParaAuth(): string {
  if (typeof window === "undefined") return SITE_URL;
  return esOrigenLocal(window.location.hostname) ? window.location.origin : SITE_URL;
}

/** La URL completa de retorno. Un único punto de canje: `/auth/callback`. */
export function urlDeRetorno(destino = "/dashboard"): string {
  const base = `${origenParaAuth()}/auth/callback`;
  return destino === "/dashboard" ? base : `${base}?next=${encodeURIComponent(destino)}`;
}
