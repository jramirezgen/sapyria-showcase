import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * El único punto donde un código de Supabase se convierte en sesión.
 *
 * La versión anterior hacía `if (code) await exchangeCodeForSession(code)` y
 * redirigía a `/dashboard` **pasara lo que pasara**: si el canje fallaba, o si
 * el proveedor devolvía un error por query, el usuario aterrizaba sin sesión en
 * una página que lo rebotaba a `/login` sin decirle nada. Un enlace de correo
 * caducado y un fallo de configuración se veían exactamente igual: como nada.
 */

/** `next` sólo puede apuntar dentro del sitio; `//evil.com` es una URL absoluta. */
function destinoSeguro(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

function aLogin(origin: string, motivo: string) {
  return NextResponse.redirect(new URL(`/login?auth_error=${encodeURIComponent(motivo)}`, origin));
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const fallo = searchParams.get("error_description") || searchParams.get("error");
  if (fallo) return aLogin(origin, fallo);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return aLogin(origin, "El espacio privado aún no tiene su conexión configurada.");
  }

  const code = searchParams.get("code");
  if (!code) return aLogin(origin, "El enlace de acceso llegó sin código. Pide uno nuevo desde aquí.");

  const response = NextResponse.redirect(new URL(destinoSeguro(searchParams.get("next")), origin));
  const store = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (items) => items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return aLogin(origin, error.message);
  return response;
}
