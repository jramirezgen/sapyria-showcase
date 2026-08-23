/**
 * La muestra sintética del espacio privado.
 *
 * Es una DEMOSTRACIÓN declarada, no un resultado. Su código lleva el prefijo
 * `DEMO-` a propósito: la versión anterior usaba el formato `SPY-####-####`,
 * que es exactamente el de los casos clínicos reales — indistinguible de uno
 * real en cualquier captura o conversación, y uno llegó a publicarse.
 *
 * Y lo que muestra tiene que ser coherente con lo que el sistema puede afirmar.
 * La versión anterior daba a los conjuntos moleculares puntajes `0.81`, `0.74`,
 * `0.62`, cuando está medido que **un conjunto encendido no identifica su
 * proceso**. Aquí van con su nivel de evidencia real.
 */
/**
 * ⚠️ Aquí NO hay código de muestra, ni estado, ni fecha —y es deliberado—.
 *
 * Los había: `sampleCode: "DEMO-0000"`, `status: "Análisis completado"`,
 * `receivedAt: "—"`. Servían de reserva cuando la consulta a la base no devolvía
 * nada, así que el panel pintaba una muestra **inventada con aire de real** y
 * quedaba **indistinguible de un éxito**. La base estaba vacía —ni una tabla—, el
 * panel se veía perfecto, y el dueño del producto creyó durante días que el
 * aprovisionamiento funcionaba.
 *
 * La identidad de la muestra sale de la base o NO SE PINTA. No basta con dejar
 * de usar el valor de reserva: mientras exista, algo volverá a pintarlo.
 *
 * Lo que sí vive aquí es el contenido demostrativo —fenotipo, conjuntos,
 * evidencia, límites—, que va rotulado como sintético y no afirma de más.
 */
export const demoResult = {
  /** Las seis dimensiones, con el nivel que el sistema realmente sostiene. */
  fenotipo: [
    { dimension: "Composición celular", nivel: "alta",
      detalle: "Marcadores de linaje confirmados por dos atlas independientes." },
    { dimension: "Regulación", nivel: "baja",
      detalle: "Features que se apartan del rango poblacional, al alza y a la baja." },
    { dimension: "Conjuntos movidos", nivel: "sin-atribucion",
      detalle: "Varios miRNA del conjunto se movieron juntos. No identifica el proceso." },
    { dimension: "Procesos compatibles", nivel: "hipotesis",
      detalle: "Inferidos desde dianas con ensayo publicado; nunca observados aquí." },
    { dimension: "Etapa", nivel: "no-evaluable",
      detalle: "Medida y no encontrada sobre cinco ejes clínicos." },
    { dimension: "Incertidumbre", nivel: "media",
      detalle: "Qué no se pudo evaluar, y por qué." },
  ],
  /**
   * Conjuntos moleculares. **Sin puntaje, a propósito.**
   *
   * Está medido que un conjunto encendido no identifica su proceso: el solape
   * entre inflamación, estrés y reparación es del 55–60 %, así que los tres se
   * encienden juntos y ninguno señala a nadie. Lo que se puede afirmar es que
   * varios miRNA del conjunto se movieron a la vez; a qué se debe, no.
   */
  modulos: [
    { nombre: "Respuesta inflamatoria", coordinacion: "Movimiento coordinado", nivel: "sin-atribucion" },
    { nombre: "Respuesta a estrés celular", coordinacion: "Movimiento coordinado", nivel: "sin-atribucion" },
    { nombre: "Reparación tisular", coordinacion: "Sin movimiento coordinado", nivel: "no-evaluable" },
  ],
  /** Los tres niveles del sistema, y cuántas lecturas caen en cada uno. */
  evidencia: [
    { nivel: "REPORTABLE", criterio: "Reproducible entre personas (ICC ≥ 0,50)", nota: "Se puede comunicar." },
    { nivel: "EXPLORATORIO", criterio: "Se mueve, pero no se sostiene entre protocolos", nota: "No se promueve." },
    { nivel: "NO ESTIMABLE", criterio: "Menos de cuatro cohortes independientes", nota: "No decide nada." },
  ],
  limitaciones: [
    "Muestra sintética de demostración: no procede de ninguna persona.",
    "Sapyria no emite diagnósticos ni valida condiciones clínicas.",
    "Los datos ómicos primarios no salen de la infraestructura controlada.",
  ],
} as const;
