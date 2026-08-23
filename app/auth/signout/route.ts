import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cerrar sesión de verdad.
 *
 * El botón «Salir» del panel era un `<Link href="/login">`: cambiaba de página y
 * dejaba la sesión intacta. Volver a `/dashboard` —o pulsar «atrás»— devolvía al
 * usuario dentro. En un ordenador compartido eso no es un detalle de estilo.
 *
 * Va por POST: un `GET` puede dispararlo un precargador o una imagen ajena, y
 * cerrarle la sesión a alguien que no lo pidió.
 */
export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(new URL("/login?sesion=cerrada", origin), { status: 303 });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return response;

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
  await supabase.auth.signOut();
  return response;
}
