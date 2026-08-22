# Sapyria Showcase

Experiencia de demostración local para conversaciones comerciales. Presenta casos
**sintéticos**, no clínicos, de small RNA-seq, WES y WGS; no procesa muestras ni
emite diagnósticos.

## Ejecutar localmente

```bash
cd showcase
cp config.example.js config.js
python3 -m http.server 4173
```

Abrir `http://localhost:4173`. Sin `config.js` el sitio usa la cohorte sintética
incluida, por lo que sigue siendo navegable en reuniones sin red.

Con la pila de contenedores, Caddy publica el showcase en `/` y conserva la API
en `/v1/*`, `/healthz` y las rutas de documentación. La interfaz está montada en
modo sólo lectura; editar la cohorte desde el navegador no forma parte del demo.

## Conectar Supabase (sólo sandbox)

1. Use un proyecto o esquema de demostración aislado de cualquier entorno
   clínico.
2. Cree y cargue la cohorte de forma reproducible, sin exponer la URL de base
   de datos:

   ```bash
   python3 -m pip install --target /tmp/sapyria-showcase-deps -r supabase/requirements.txt
   PYTHONPATH=/tmp/sapyria-showcase-deps python3 supabase/seed_showcase.py \
     --credential-file ../credenciales_supabase_sapyria
   ```

3. Copie `config.example.js` como `config.js` y complete `url` y `anonKey` con
   los valores locales de `credenciales_supabase_sapyria`. `config.js` está en
   `.gitignore`; nunca se versiona.
4. Mantenga RLS activado. La política incluida expone únicamente filas marcadas
   como `is_public_demo = true`; no use una service-role key en el navegador.

El cliente consulta Supabase REST directamente y vuelve al dataset local si el
servicio no está disponible. Eso hace que el demo sea robusto, pero la UI muestra
de forma explícita qué fuente está activa.

Si Supabase devuelve 401 para la clave publishable, renuévela en el dashboard
del proyecto. Nunca sustituya esa clave por una `sb_secret_*`: esa llave sólo
se usa para administración del servidor.

## Límite de producto

- `small RNA-seq`: señal investigacional y generación de hipótesis, no
  diagnóstico ni biomarcador clínicamente validado.
- `WES`: priorización técnica de variantes; requiere revisión clínica para
  cualquier decisión asistencial.
- `WGS`: vista de diseño/piloto. No afirma capacidad clínica para SV, CNV,
  mitocondrial, expansiones ni mosaicismo.

No añada identificadores personales, FASTQ/BAM/VCF reales, informes reales ni
credenciales al directorio `showcase/`.
