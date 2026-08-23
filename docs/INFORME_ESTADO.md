# Informe de estado — Sapyria showcase

**Fecha:** 2026-08-23 · **Alcance:** `sapyria-showcase` en `www.sapyria.com`
**Método:** todo lo que sigue está medido contra producción o calculado. Lo que
no se pudo comprobar se dice, no se rellena.

---

## A) Estado actual funcional

### Acceso y aprovisionamiento — **verificado de punta a punta**

`scripts/prueba_flujo_completo.py` crea una cuenta real, la recorre entera y la
**borra en un `finally`**. Resultado, entero en verde:

| Comprobación | Resultado |
| --- | --- |
| alta de cuenta | ✅ |
| login por `/auth/v1/token` (el endpoint del formulario) | ✅ devuelve sesión |
| el trigger crea el perfil | ✅ con el `full_name` del formulario |
| `claim_demo_sample()` con el JWT del usuario | ✅ asigna, y es **idempotente** |
| la fila leída **por el propio usuario vía RLS** | ✅ `DEMO-####` · `ready` · `is_demo` · `user_id` correcto |
| aislamiento | ✅ ve **una** fila: la suya |
| borrado en cascada | ✅ al eliminar la cuenta no quedan perfil ni muestra |

El panel se comprobó además **pidiendo `/dashboard` con una cookie de sesión
real** contra el dominio: HTTP 200, código `DEMO-####` de la base, fenotipo,
conjuntos, evidencia, límites y la cadena de estado marcando el paso actual.

### Estado de la base

`auth.users = 1 · profiles = 1 · samples = 1`. Sin restos de ninguna prueba.

### Correo — Resend **acepta**, la entrega no se pudo auditar

Un registro real por correo/contraseña devuelve **HTTP 200 sin sesión** (correcto:
exige confirmar) y deja `confirmation_sent_at` puesto. Como un SMTP mal
configurado hace fallar el `signUp`, esto **prueba que Resend respondió**.

> ⚠️ **Que el correo LLEGUE al buzón sigue sin verificarse.** La clave de Resend
> del fichero es de **sólo envío** —buena práctica— y su API rechaza leer el
> registro de entregas (`restricted_api_key`). Se comprueba desde el panel de
> Resend, o registrando una dirección real.

### Rutas públicas

Las ocho responden 200; `/dashboard` sin sesión redirige a `/login`; un `?code=`
extraviado en cualquier ruta se reenvía al canje.

---

## B) Pendientes técnicos — bugs reales encontrados

| # | Defecto | Estado |
| --- | --- | --- |
| 1 | **El acento azul `#2a78d6` no pasaba WCAG AA**: 4,42:1 sobre blanco, por debajo de 4,5 | ✅ corregido — el teal de marca da 4,74:1 |
| 2 | **El logotipo oficial no se usaba en ninguna parte**: navegación, favicon y OG mostraban una «S» azul generada | ✅ corregido |
| 3 | **El nombre del usuario no aparecía**. El dato **sí estaba** en `profiles.full_name` desde el trigger: la interfaz nunca lo pedía | ✅ corregido en la capa de vista |
| 4 | **Texto blanco sobre el acento en modo oscuro: 1,64:1** — ilegible. El acento oscuro (`#40E0D0`) es claro y el texto seguía siendo blanco | ✅ corregido con `--on-accent` |
| 5 | Igual en los distintivos de criterio: blanco sobre `good`/`critical` oscuros daba **2,07:1** y **2,23:1** | ✅ corregido con `--on-status` |
| 6 | Los campos de formulario usaban el borde decorativo (**1,86:1**), cuando el borde **es** el límite del control y pide 3:1 | ✅ corregido con `--border-strong` |
| 7 | Tipografía **Manrope**, fuera del manual | ✅ ahora Inter |

### Lo que sigue abierto

- **Entrega real del correo**, por lo dicho arriba.
- **Los activos de marca derivados están PENDIENTES DE TU APROBACIÓN.** El manual
  lo exige explícitamente. Ver sección D.
- **`good` y `critical` son propuesta**: el manual v0.1 no define colores de
  éxito ni de error.
- El manual **no define tipografía monoespaciada** y los códigos `DEMO-####` la
  necesitan. Se conserva DM Mono; queda declarado como hueco.

---

## C) Recomendaciones

1. **Cerrar los entregables de marca pendientes** que el propio manual lista:
   versión inversa aprobada del logotipo para fondo oscuro (medido: el logotipo
   tipográfico sobre `#002626` da **1,01:1**, es decir, invisible) y el símbolo
   aislado oficial. Los que se derivaron aquí son mecánicos y están para revisar.
2. **Definir en el manual los estados de éxito y error.** Es el único hueco que
   obliga a proponer color, y proponer color es justo lo que un manual evita.
3. **Comprobar una entrega real de Resend** y, si se quiere auditoría, emitir una
   clave de lectura aparte de la de envío.
4. **Aviso de privacidad**: la web recoge correo y nombre al registrarse y no hay
   ninguno. No bloquea, pero es lo siguiente que pedirá un cliente.

---

## D) Auditoría visual: manual de marca vs. aplicación

### Lo que estaba fuera de manual

| Elemento | Manual v0.1 | Antes | Ahora |
| --- | --- | --- | --- |
| Color de acción | `#257F80` | `#2a78d6` | `#257F80` |
| Texto principal | `#002626` | `#0b0b0b` | `#002626` |
| Fondo oscuro | `#002626` | `#121211` | `#002626` |
| Resalte en oscuro | `#40E0D0` | `#3987e5` | `#40E0D0` |
| Tipografía | Inter | Manrope | Inter |
| Logotipo | `logo_sapyria.png` | no se usaba | símbolo oficial |
| Favicon | símbolo | «S» azul generada | símbolo oficial |

### Contrastes calculados (WCAG AA = 4,5:1 texto · 3:1 objeto gráfico)

**Modo claro** — superficies `#FFFFFF` / `#FBFBF6` / `#F1F3EE`

| Token | Valor | Sobre blanco |
| --- | --- | --- |
| `--ink-1` | `#002626` | **16,09:1** ✅ |
| `--ink-2` | `#3D5C5C` | **7,28:1** ✅ |
| `--ink-3` | `#577373` | **5,12:1** ✅ |
| `--accent` | `#257F80` | **4,74:1** ✅ |
| `--accent-strong` | `#004C4C` | **9,82:1** ✅ |
| `--good` *(propuesta)* | `#1F7A4D` | **5,32:1** ✅ |
| `--critical` *(propuesta)* | `#B3402E` | **5,69:1** ✅ |
| `--border-strong` | `#7E9995` | **3,05:1** ✅ objeto gráfico |

**Modo oscuro** — superficies `#002626` / `#063434` / `#0D4240`

| Token | Valor | Sobre el fondo |
| --- | --- | --- |
| `--ink-1` | `#FFFFFF` | **16,09:1** ✅ |
| `--ink-2` | `#B6CFCF` | **9,82:1** ✅ |
| `--accent` | `#40E0D0` | **9,80:1** ✅ |
| `--on-accent` | `#002626` sobre `#40E0D0` | **9,80:1** ✅ |
| `--border-strong` | `#4A8884` | **3,94:1** ✅ |

**Rellenos de estado**, con la regla del manual (texto oscuro encima):
`#002626` sobre mostaza `#FFDB58` → **11,89:1** ✅ · sobre coral `#FF7F50` →
**6,44:1** ✅. Como **texto sobre blanco** dan 1,35:1 y 2,50:1 — por eso el manual
los prohíbe ahí, y por eso aquí sólo son relleno.

> La superficie beige del manual (`#F5F5DC`) deja el acento en **4,29:1**, por
> debajo de AA. Se usa `#FBFBF6` —el mismo tono, aclarado— que lo mantiene en
> 4,57:1. En `--surface-2` el acento tampoco llega (4,25:1): ahí va
> `--accent-strong`.

### Los colores de serie NO se cambiaron, a propósito

Las figuras del explorador usan una paleta categórica validada contra daltonismo.
**No es cromatismo de marca, es codificación de datos**: con un solo tono no se
distinguen ocho series, y repintarlas rompería una separación ya verificada. El
manual admite paletas por contexto (§2). Decisión consciente, no descuido.

### El logotipo: qué se derivó y cómo

`scripts/extraer_marca.py` produce, **desde los píxeles del original**, la versión
transparente del lockup, el símbolo aislado y el logotipo tipográfico. Sin
redibujar, sin filtros, sin halo, sin recolorear — no es la extracción generativa
que el manual registra como rechazada.

**Prueba de fidelidad**, que es lo que el manual pide al decir «aprobada contra el
original»: se recompone el resultado sobre el lienzo medido y se diferencia píxel
a píxel contra el original.

```
diferencia sobre la tinta:  máxima 0,0/255 · media 0,0/255
diferencia global:         máxima 27/255  → es el grano del lienzo, que es lo que se quita
```

El script **aborta y no escribe nada** si la tinta cambia más de 3/255.

**Dos discrepancias medidas entre el archivo y el manual**, que conviene resolver
en la próxima versión del manual:

| | Manual | Medido en el archivo |
| --- | --- | --- |
| Teal del símbolo | `#257F80` | `#1d797d` |
| Tinta del logotipo | `#002626` | `#192223` |

No se corrigió ninguno: el manual prohíbe recolorear el logotipo. La interfaz usa
los valores del **manual**; el logotipo conserva **sus propios píxeles**.

**Por qué la navegación no usa el lockup completo:** es vertical y no cabe en una
barra de 64 px, y su tinta sobre el fondo oscuro del manual da **1,01:1**. Se usa
el símbolo (**3,13:1** sobre oscuro, suficiente para un elemento gráfico) más el
nombre en Inter, hasta que exista la versión inversa aprobada.

> ⛔ **Los cuatro archivos de `public/marca/` están PENDIENTES DE APROBACIÓN.**
> Su procedencia y sus cifras están en `public/marca/PROCEDENCIA.json`.

### Regla del manual que se respeta en todo el sistema

**Nunca estado sólo por color.** Cada distintivo de evidencia lleva punto **y**
etiqueta; cada criterio, icono **y** texto.
