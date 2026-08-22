# Sapyria Showcase

Primera versión de producto de Sapyria para explicar su enfoque de fenotipo
molecular y permitir a una persona explorar una muestra **sintética** en un
espacio privado. Vercel despliega este repositorio directamente; no se crea ni
gestiona otro hosting.

## Frontera del repositorio

Este es el **único repositorio de interfaz web pública** de Sapyria. Es dueño de
`https://www.sapyria.com`, `https://sapyria.com` y del deployment de Vercel
`sapyria-showcase`. No debe duplicarse dentro de `sapyria-platform` ni de los
pipelines.

`sapyria-platform` es el backend privado de metadatos operativos, auditoría y
artefactos; `smallrna-clinical-pipeline` y `sapyria` son repositorios técnicos
de análisis y gobierno de datos. Esta web puede consumir contratos públicos y
resultados resumidos, pero nunca datos ómicos primarios, identificadores reales
ni secretos. La decisión y el mapa completo quedan registrados en la LLM Wiki:
[[Sapyria - Fronteras Canónicas de Repositorios y Despliegue]].

## Arquitectura

| Capa | Uso |
| --- | --- |
| Next.js + Vercel | Página pública, login y dashboard protegido. |
| Supabase Auth | Google OAuth y correo/contraseña. |
| Supabase PostgreSQL | Perfiles, estados de muestra y resultados demo resumidos. |
| Infraestructura local | small RNA-seq, WES, WGS y todos los artefactos pesados. |

Supabase no recibe FASTQ, BAM, CRAM, VCF completos ni informes clínicos. El
dashboard tampoco formula diagnósticos: presenta señal, inferencia, evidencia y
limitaciones como capas distintas.

## Configuración de Supabase

1. En el SQL Editor del proyecto `Sapyria_platform`, ejecute
   [`supabase/001_product_demo.sql`](supabase/001_product_demo.sql).
2. En Authentication, habilite Google y Email. Para Google, agregue estas URLs
   de redirección:

   ```text
   https://sapyria.com/auth/callback
   https://www.sapyria.com/auth/callback
   https://sapyria-showcase.vercel.app/auth/callback
   ```

3. En Vercel → `sapyria-showcase` → Environment Variables, cargue para
   Production, Preview y Development las dos variables de [`.env.example`](.env.example):

   ```text
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   ```

   Son valores públicos de cliente. Nunca cargue una clave `sb_secret_*`, una
   service-role key ni una URL de PostgreSQL en Vercel o el navegador.

La función `claim_demo_sample()` crea de forma idempotente una muestra demo
aislada por usuario autenticado. Las políticas RLS impiden leer perfiles,
muestras o resultados de otros usuarios.

## Desarrollo local

```bash
cp .env.example .env.local
npm install
npm run dev
```

El build de producción se verifica con `npm run build`.

## Alcance de lenguaje

- **small RNA-seq:** recuperación de hipótesis sustentadas, no clasificación
  diagnóstica ni biomarcador clínicamente validado.
- **WES:** priorización técnica que requiere revisión clínica independiente.
- **WGS:** sólo dentro del alcance técnico explícito de cada piloto.

La página y el dashboard son una demo funcional de producto; no sustituyen la
operación clínica ni procesan muestras reales.
