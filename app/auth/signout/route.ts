import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cerrar sesión de verdad, y que no quede nada.
 *
 * El botón «Salir» empezó siendo un `<Link href="/login">`: cambiaba de página y
 * dejaba la sesión intacta. Ya no. Y hay tres detalles que, si faltan, la sesión
 * parece cerrada y no lo está:
 *
 *   · **`scope: "global"`** — revoca el token en el servidor, no sólo en este
 *     navegador. Sin esto la sesión sigue viva en cualquier otro dispositivo.
 *   · **Las cookies TROCEADAS.** Una sesión grande no cabe en una cookie, así que
 *     `@supabase/ssr` la parte en `…auth-token.0`, `.1`… Borrar sólo el nombre
 *     base deja los trozos, y con ellos una sesión reconstruible.
 *   · **`Cache-Control: no-store`** — si no, el botón «atrás» puede mostrar el
 *     panel de la persona que acaba de salir, sacado del caché del navegador.
 *
 * Va por POST: un `GET` puede dispararlo un precargador o una imagen ajena, y
 * cerrarle la sesión a alguien que no lo pidió.
 */
export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(new URL("/login?sesion=cerrada", origin), { status: 303 });
  response.headers.set("Cache-Control", "no-store, max-age=0");

  const store = await cookies();

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
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
    await supabase.auth.signOut({ scope: "global" });
  }

  // Barrido explícito: cualquier cookie de sesión que siga en pie, incluidos los
  // trozos numerados, se expira aquí. La biblioteca debería hacerlo; esto
  // garantiza que no quede ninguno aunque cambie su formato interno.
  for (const cookie of store.getAll()) {
    if (/^sb-.*-auth-token(\.\d+)?$/.test(cookie.name)) {
      response.cookies.set(cookie.name, "", { path: "/", maxAge: 0 });
    }
  }

  return response;
}
