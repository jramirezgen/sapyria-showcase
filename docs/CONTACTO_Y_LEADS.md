# Contacto y leads comerciales

La página pública usa un solo recorrido: `/contacto` para el formulario, enlaces
contextuales a WhatsApp y los correos institucionales. No es un canal de datos
clínicos ni genéticos y no inicia un análisis.

## Arquitectura

- `app/contacto/page.tsx`: interfaz pública y accesible.
- `components/contact-form.tsx`: validación de interacción, consentimiento,
  honeypot y aviso de no compartir archivos o resultados.
- `app/api/contacto/route.ts`: valida de nuevo en servidor, crea el lead mediante
  una RPC limitada y, después, notifica por Resend. La captura no se revierte si
  el correo falla.
- `supabase/005_leads_comerciales.sql`: tablas de propietarios, leads y eventos
  de aviso; la función `create_commercial_lead` es la única entrada pública.

El formulario nunca recibe una clave de servicio. La clave pública de Supabase
solo ejecuta la RPC de inserción, que no devuelve más que el identificador recién
creado. Las tablas no conceden `SELECT`, `UPDATE` ni `DELETE` a `anon` o
`authenticated`. El registro de estado de email requiere exclusivamente la clave
de servicio del servidor.

## Configuración de producción

En Vercel, para los entornos Production y Preview que correspondan, definir:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=https://www.sapyria.com
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
CONTACT_NOTIFICATION_FROM=Sapyria <noreply@sapyria.com>
CONTACT_NOTIFICATION_TO=ventas@sapyria.com
```

Las tres últimas claves son solo de servidor: no usar el prefijo
`NEXT_PUBLIC_`, no incluirlas en Git y no exponerlas a clientes.

Antes de activar el aviso, verificar en Resend el dominio y el remitente
`noreply@sapyria.com`. Si falta Resend o el remitente, el lead se guarda y el
evento queda como `skipped` cuando está configurada la clave de servicio.

## Operación comercial pendiente

1. Crear o confirmar en Google Workspace los buzones/alias `info@sapyria.com`,
   `ventas@sapyria.com` y `noreply@sapyria.com`.
2. Configurar una persona responsable activa en `commercial_owners`. La migración
   deja a Vilma como asignación inicial, pero permite añadir o desactivar
   responsables sin cambiar código.
3. Aplicar `supabase/005_leads_comerciales.sql` mediante Supabase SQL Editor o
   una conexión PostgreSQL con IPv4/pooler. La conexión directa disponible en el
   entorno local resuelve solo a IPv6 y no es enrutable desde este servidor.
4. Tras aplicar la migración, probar una solicitud de prueba y comprobar:
   - hay una fila en `commercial_leads` con estado `Nuevo`;
   - un visitante anónimo no puede leer esa tabla;
   - se registra `lead_notification_events` como `sent`, `skipped` o `error`;
   - el aviso llega a `ventas@sapyria.com` y no contiene secretos.

No añadir RUC ni razón social al pie público hasta contar con el texto legal
confirmado. La interfaz solo identifica Sapyria y Lima, Perú.
