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

## De dónde salen los datos que muestra

**Ninguna cifra de esta web se escribe a mano.** `public/showcase/` lo genera
`scripts/export_public_showcase.py` del repositorio `smallrna-clinical-pipeline`,
leyendo los artefactos reales de ocho cohortes públicas ya procesadas por el
pipeline. Para regenerarlo:

```bash
cd ../smallrna-clinical-pipeline
python3 scripts/export_public_showcase.py --out ../sapyria-showcase/public/showcase
```

Ese exportador **comprueba la frontera antes de escribir**: falla si en la salida
aparece un identificador de caso clínico (`SPY-####-####`) o una ruta interna. Sin
esa comprobación, la frontera que este README declara sería sólo una intención.

> Antes de agosto de 2026 esta web mostraba datos **inventados** —conjuntos
> moleculares con puntajes fabricados— que además contradecían lo que el pipeline
> había medido: **un conjunto encendido no identifica su proceso**. Y usaba el
> identificador de un caso clínico real como código de demo. Las dos cosas están
> corregidas y hay una comprobación que impide que vuelvan.

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

1. En el SQL Editor del proyecto `Sapyria_platform`, ejecute **en orden**
   [`supabase/001_product_demo.sql`](supabase/001_product_demo.sql) y después
   [`supabase/002_demo_sample_code.sql`](supabase/002_demo_sample_code.sql).
   La segunda es obligatoria: `001` exige códigos con el formato `SPY-####-####`,
   que es el de los casos clínicos **reales**, y `002` los pasa a `DEMO-####`
   para que una muestra sintética no se pueda confundir con una real.
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
