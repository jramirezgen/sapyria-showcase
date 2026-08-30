import { NextResponse } from "next/server";
import { mensajeHumano, type ErrorTraducible } from "@/lib/auth-messages";
import { createSupabaseRouteClient } from "@/lib/supabase-server";

/**
 * El único punto donde un código de Supabase se convierte en sesión.
 *
 * La versión anterior hacía `if (code) await exchangeCodeForSession(code)` y
 * redirigía a `/dashboard` **pasara lo que pasara**: si el canje fallaba, o si
 * el proveedor devolvía un error por query, el usuario aterrizaba sin sesión en
 * una página que lo rebotaba a `/login` sin decirle nada. Un enlace de correo
 * caducado y un fallo de configuración se veían exactamente igual: como nada.
 */

/**
 * `next` sólo puede apuntar dentro del sitio.
 *
 * La versión anterior rechazaba `//evil.com` comparando el prefijo a mano, pero
 * dejaba pasar `/\evil.com`: el parser de URL de WHATWG normaliza `\` a `/` en
 * esquemas especiales, así que `new URL("/\\evil.com", origin)` resolvía a
 * `https://evil.com/` — un open redirect justo después de canjear la sesión.
 * Resolver de verdad y comparar el origen resultante cierra cualquier variante
 * de esa clase de bypass, no sólo la que ya se conocía.
 */
function destinoSeguro(raw: string | null, origin: string): string {
  if (!raw) return "/dashboard";
  try {
    const resuelto = new URL(raw, origin);
    if (resuelto.origin !== origin) return "/dashboard";
    return `${resuelto.pathname}${resuelto.search}${resuelto.hash}`;
  } catch {
    return "/dashboard";
  }
}

function aLogin(origin: string, motivo: ErrorTraducible) {
  return NextResponse.redirect(new URL(`/login?auth_error=${encodeURIComponent(mensajeHumano(motivo))}`, origin));
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // GoTrue manda `error_code` (estable) junto al `error`/`error_description`
  // (texto, puede cambiar) cuando el proveedor o el propio canje falla antes de
  // llegar aquí --- por ejemplo un magic link ya usado o un `redirect_to` fuera
  // de la lista blanca. Pasar el código deja que `mensajeHumano` lo resuelva sin
  // depender de comparar el texto exacto en inglés.
  const fallo = searchParams.get("error_description") || searchParams.get("error");
  if (fallo) return aLogin(origin, { message: fallo, code: searchParams.get("error_code") });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return aLogin(origin, "El espacio privado aún no tiene su conexión configurada.");
  }

  const code = searchParams.get("code");
  if (!code) return aLogin(origin, "El enlace de acceso llegó sin código. Pide uno nuevo desde aquí.");

  const response = NextResponse.redirect(new URL(destinoSeguro(searchParams.get("next"), origin), origin));
  const supabase = await createSupabaseRouteClient(response);

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return aLogin(origin, error);
  return response;
}
