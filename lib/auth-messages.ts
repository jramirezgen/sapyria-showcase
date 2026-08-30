/**
 * Los errores de Supabase, dichos en castellano y para una persona.
 *
 * Sin esto, quien abre el enlace de confirmación en otro navegador recibe, tal
 * cual, en su pantalla:
 *
 *   «PKCE code verifier not found in storage. This can happen if the auth flow
 *    was initiated in a different browser or device… For SSR frameworks
 *    (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and
 *    client to store the code verifier in cookies.»
 *
 * Es una nota de un programador a otro programador, filtrada al cliente. Dice la
 * causa correcta y no dice qué hacer. Aquí se traduce a la acción concreta que
 * resuelve cada caso; lo que no reconocemos se deja pasar íntegro, porque un
 * mensaje raro es mejor que un «algo salió mal» que no permite ni preguntar.
 *
 * ⚠️ 2026-08-28: este fichero se parcheó dos veces (`b347a69`, `4b9784f`) sólo
 * añadiendo más patrones de texto, porque comparaba contra el **texto exacto en
 * inglés** que devuelve Supabase — y ese texto puede cambiar sin aviso en
 * cualquier versión del SDK. `@supabase/auth-js` sí expone un `error.code`
 * estable (`ErrorCode` en `node_modules/@supabase/auth-js/dist/main/lib/error-codes.d.ts`)
 * para los errores de Auth: se resuelve por ahí primero. El regex sobre el
 * mensaje queda como red de reserva para lo que no tiene código (errores de
 * Postgres/RPC, o el `PKCE code verifier` que lanza el propio SDK sin pasar por
 * el servidor) y para SDKs más viejos. Lo que no matchea ninguno de los dos se
 * registra con `console.warn` en vez de desaparecer: así un cambio de texto
 * futuro se ve en los logs en vez de filtrarse en silencio a la pantalla.
 */
const CODIGOS: Readonly<Record<string, string>> = {
  invalid_credentials: "Ese correo y esa contraseña no coinciden. Revísalos e inténtalo otra vez.",
  email_not_confirmed: "Todavía falta confirmar tu correo. Busca el mensaje que te enviamos —mira también la carpeta de no deseados.",
  user_already_exists: "Ese correo ya tiene un espacio. Entra con tu contraseña desde la pestaña «Ingresar».",
  identity_already_exists: "Ese correo ya tiene un espacio. Entra con tu contraseña desde la pestaña «Ingresar».",
  weak_password: "La contraseña necesita al menos 8 caracteres.",
  over_email_send_rate_limit: "Pediste varios correos seguidos. Espera un minuto y vuelve a intentarlo.",
  over_request_rate_limit: "Demasiados intentos seguidos. Espera un minuto y vuelve a intentarlo.",
  otp_expired: "El enlace del correo caducó o ya se había usado. Pide uno nuevo desde aquí.",
  session_expired: "Tu sesión caducó. Vuelve a entrar y lo retomamos donde estabas.",
  flow_state_expired: "El enlace de acceso caducó. Pide uno nuevo desde aquí.",
  flow_state_not_found: "Este enlace ya se usó o caducó. Pide uno nuevo desde aquí.",
  bad_code_verifier: "Este enlace hay que abrirlo en el mismo navegador desde el que creaste la cuenta. Ábrelo ahí, o pide uno nuevo desde aquí.",
  bad_oauth_callback: "El acceso con Google no se pudo completar. Inténtalo otra vez.",
  bad_oauth_state: "El acceso con Google no se pudo completar. Inténtalo otra vez.",
  email_address_invalid: "Ese correo no es válido. Revísalo e inténtalo otra vez.",
  signup_disabled: "El registro no está disponible en este momento.",
  user_banned: "Esta cuenta no tiene acceso. Contáctanos si crees que es un error.",
};

const TRADUCCIONES: ReadonlyArray<readonly [RegExp, string]> = [
  [/pkce code verifier not found/i,
   "Este enlace hay que abrirlo en el mismo navegador desde el que creaste la cuenta. Ábrelo ahí, o pide uno nuevo desde aquí."],
  [/(email link is invalid|otp_expired|token has expired|expired)/i,
   "El enlace del correo caducó o ya se había usado. Pide uno nuevo desde aquí."],
  [/invalid login credentials/i,
   "Ese correo y esa contraseña no coinciden. Revísalos e inténtalo otra vez."],
  [/email not confirmed/i,
   "Todavía falta confirmar tu correo. Busca el mensaje que te enviamos —mira también la carpeta de no deseados."],
  [/user already registered/i,
   "Ese correo ya tiene un espacio. Entra con tu contraseña desde la pestaña «Ingresar»."],
  [/password should be at least/i,
   "La contraseña necesita al menos 8 caracteres."],
  [/(rate limit|you can only request this after)/i,
   "Pediste varios correos seguidos. Espera un minuto y vuelve a intentarlo."],
  [/could not find the (function|table)|schema cache|PGRST(202|205)/i,
   "Esta parte del espacio todavía se está preparando. Vuelve en un momento; no es culpa tuya."],
  [/perfil no reconocido/i,
   "Ese perfil no está disponible. Elige otro de la lista."],
  [/hace falta una sesión/i,
   "Tu sesión caducó. Vuelve a entrar y lo retomamos donde estabas."],
  [/no hay una muestra activa/i,
   "Tu espacio todavía se está preparando. Recarga la página en unos segundos; si sigue igual, sal y vuelve a entrar."],
  [/redirect_to.*not allowed|invalid redirect/i,
   "Este enlace apunta a una dirección que el sistema no reconoce. Avísanos: es un fallo nuestro de configuración, no tuyo."],
];

export type ErrorTraducible = string | { message: string; code?: string | null };

export function mensajeHumano(bruto: ErrorTraducible): string {
  const mensaje = typeof bruto === "string" ? bruto : bruto.message;
  const codigo = typeof bruto === "string" ? undefined : bruto.code ?? undefined;

  if (codigo && CODIGOS[codigo]) return CODIGOS[codigo];
  for (const [patron, texto] of TRADUCCIONES) if (patron.test(mensaje)) return texto;

  // Ni el código ni el texto conocido matchearon: es exactamente el caso que
  // hizo falta parchear dos veces antes. Se deja pasar el mensaje bruto (mejor
  // un texto raro que un «algo salió mal» mudo) pero queda en el log del
  // servidor o de la consola del navegador para que se note sin esperar a que
  // alguien reporte la pantalla.
  console.warn("[auth-messages] mensaje sin traducción" + (codigo ? ` (code: ${codigo})` : ""), mensaje);
  return mensaje;
}
