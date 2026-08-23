import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Dos trabajos, y el primero es una red de seguridad aprendida a golpes.
 *
 * 1. **Rescatar un código extraviado.** Cuando el `redirect_to` que pide la web
 *    no está en la lista blanca de Supabase, GoTrue lo descarta sin avisar y
 *    manda el código al *Site URL* — o sea, a la **raíz** del sitio, donde no hay
 *    nada que lo canjee. El usuario ve `…/?code=c8e68fe2-…` en la barra y una
 *    página normal, sin sesión. Pasó de verdad el 2026-08-22 (contra
 *    `localhost:3000`, que además ni siquiera respondía).
 *    Arreglar la lista blanca es la cura; esto es el cinturón: venga por donde
 *    venga, un `code` acaba en `/auth/callback`.
 * 2. **Refrescar la sesión** en el área privada, y sólo ahí — no en cada página
 *    pública, que costaría una llamada a Supabase por visita.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname !== "/auth/callback" && (searchParams.has("code") || searchParams.has("error_description"))) {
    const destino = new URL("/auth/callback", request.url);
    searchParams.forEach((valor, clave) => destino.searchParams.set(clave, valor));
    // La raíz no es un destino; cualquier otra ruta sí merece volver a ella.
    if (pathname !== "/") destino.searchParams.set("next", pathname);
    return NextResponse.redirect(destino);
  }

  if (!pathname.startsWith("/dashboard")) return NextResponse.next({ request });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) => {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  await supabase.auth.getUser();
  return response;
}

// Ancho a propósito: el código extraviado puede aterrizar en cualquier ruta. Se
// excluyen los estáticos para no pagar el rodeo en cada figura del explorador.
export const config = {
  matcher: ["/((?!_next/static|_next/image|showcase/|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico|txt|xml|json|csv)$).*)"],
};
