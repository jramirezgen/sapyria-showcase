# Páginas legales y verificación de Google OAuth

## Por qué existen

Google exige, para verificar una aplicación OAuth, **URLs públicas y accesibles
sin autenticación** de la página principal, la política de privacidad y los
términos del servicio. Estaban registradas en la consola de Google, pero
`/privacy` y `/terms` devolvían **404**.

## Las URLs que hay que poner en Google

Copiar exactamente éstas en **Google Auth Platform → Marca / Branding**:

| Campo | URL |
| --- | --- |
| Página principal | `https://www.sapyria.com` |
| Política de privacidad | `https://www.sapyria.com/privacy` |
| Términos del servicio | `https://www.sapyria.com/terms` |

> El apex (`sapyria.com`) redirige a `www` con un 308 que conserva la ruta, así
> que ambas formas funcionan. Se recomienda registrar la de `www`, que es la
> canónica del despliegue.

## Cómo están servidas

El sitio está en castellano y sus rutas también (`/como-funciona`, `/evidencia`),
así que las **canónicas** son `/privacidad` y `/terminos`. Las inglesas se sirven
con **`rewrites`, no con `redirects`**:

```ts
{ source: "/privacy", destination: "/privacidad" }
{ source: "/terms",   destination: "/terminos" }
```

Un *rewrite* devuelve **200 directamente**, sin salto. Un revisor de Google que
reciba un 308 puede darlo por bueno, o puede no hacerlo — y no hay ningún motivo
para arriesgarlo por una redirección que no aporta nada. El `canonical` de cada
página apunta a la ruta en castellano, así que no hay contenido duplicado.

También responden `/privacy-policy` y `/terms-of-service`, que son las variantes
que algunos formularios sugieren.

## Qué dicen, y contra qué se escribieron

No son plantillas. El marco es el que ya está documentado en el vault
(`Marco Regulatorio Sanitario Sapyria`):

| Norma | Qué aporta al documento |
| --- | --- |
| **Ley N.º 29733** — Protección de Datos Personales | Datos genéticos = **datos sensibles**; derechos ARCO; **flujo transfronterizo** |
| **Ley N.º 26842** — General de Salud | Sitúa la actividad bajo regulación sanitaria |
| **Ley N.º 29571** — Código del Consumidor | Relación con el usuario, INDECOPI |

Dos decisiones de fondo:

1. **La privacidad separa dos tratamientos** que no se parecen en nada: lo que
   guarda *esta web* (correo, nombre, un código `DEMO-####` — ningún dato
   biológico) y lo que trata *el servicio de análisis* (muestra y datos
   derivados). Confundirlos sería deshonesto en cualquiera de las dos
   direcciones. Y se declara la **transferencia internacional**: la secuenciación
   se hace fuera del país, y eso es flujo transfronterizo de datos sensibles.

2. **Los términos ponen en la cláusula 2, destacada**, lo que gobierna a todo lo
   demás: **Sapyria entrega tamizaje e interpretación técnica, no diagnóstico
   médico.** No es una fórmula defensiva; es lo que el sistema puede sostener.

> ⚠️ **Pendiente antes del lanzamiento comercial:** estos documentos son un
> borrador sólido y honesto, **no asesoría legal**. El expediente
> `AL-0862` del vault tiene la lista de preguntas abiertas para el abogado
> —clasificación del servicio, registro IPRESS, quién firma el informe,
> obligaciones por la transferencia a China—. Deben revisarse con esa asesoría
> antes de cobrar por un análisis.

## El fondo blanco, y por qué se tocó aquí

El modo oscuro **automático** está desactivado. No había interruptor de tema, así
que `prefers-color-scheme` hacía que la preferencia del sistema operativo del
visitante —puesta para todo, no para este sitio— decidiera el fondo. Quien
tuviera el sistema en oscuro veía Sapyria en verde profundo.

El manual asigna `#FFFFFF` a «fondo principal y espacio negativo», y el `#002626`
a piezas institucionales. La paleta oscura **se conserva entera y validada** bajo
`[data-theme="dark"]`: el día que haya interruptor, funciona sin tocar un color.

## Estado del nombre en la pantalla de Google

Comprobado el 2026-08-23 renderizando la pantalla de consentimiento con un
navegador sin cabeza: seguía diciendo **«Sign in to continue to Claude»**. El
cambio de marca en Google Auth Platform puede tardar en propagarse, y en algunos
casos **no se aplica hasta que la verificación avanza**.

**Confirmado por el fundador el 2026-08-28: ya dice «Sapyria».** El botón de
Google se reactivó (`GOOGLE_DISPONIBLE = true` en `components/auth-form.tsx`).
Para volver a comprobarlo si hiciera falta:

```bash
# La pantalla NO se ve con curl: Google devuelve un 302 vacío. Hay que renderizar.
chrome --headless --dump-dom "<URL de /auth/v1/authorize?provider=google&redirect_to=…>"
```

Si alguna vez vuelve a aparecer «Claude», poner `GOOGLE_DISPONIBLE = false` de
nuevo en ese archivo es la única acción necesaria.
