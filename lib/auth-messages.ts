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
 */
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
  [/redirect_to.*not allowed|invalid redirect/i,
   "Este enlace apunta a una dirección que el sistema no reconoce. Avísanos: es un fallo nuestro de configuración, no tuyo."],
];

export function mensajeHumano(bruto: string): string {
  for (const [patron, texto] of TRADUCCIONES) if (patron.test(bruto)) return texto;
  return bruto;
}
