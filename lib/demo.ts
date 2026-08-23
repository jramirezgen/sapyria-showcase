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
export const demoResult = {
  sampleCode: "DEMO-0000",
  status: "Análisis completado",
  receivedAt: "—",
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
  limitaciones: [
    "Muestra sintética de demostración: no procede de ninguna persona.",
    "Sapyria no emite diagnósticos ni valida condiciones clínicas.",
    "Los datos ómicos primarios no salen de la infraestructura controlada.",
  ],
} as const;
