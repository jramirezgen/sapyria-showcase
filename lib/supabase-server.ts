import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured");
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );
}

/**
 * Cliente de servidor que SÍ escribe cookies, sobre una respuesta ya creada.
 * Lo necesitan las dos rutas que persisten un cambio de sesión —canjear un
 * código (`/auth/callback`) y cerrarla (`/auth/signout`)— y antes cada una
 * reimplementaba el mismo puente `getAll`/`setAll` por su cuenta: un cambio en
 * cómo `@supabase/ssr` trocea la cookie de sesión había que aplicarlo dos veces
 * y era fácil olvidar una.
 */
export async function createSupabaseRouteClient(response: NextResponse) {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured");
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) => items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  );
}
