/**
 * Los cinco conjuntos biológicos, dichos para una persona.
 *
 * El patrón es nombre humano arriba y término técnico debajo: se lee de un
 * vistazo sin perder la palabra que permite buscar más. Un informe que sólo dice
 * «Inflamación aguda» es frío; uno que sólo dice «tu respuesta inflamatoria»
 * pierde la trazabilidad, que es justo el argumento de Sapyria.
 *
 * ⚠️ Y el límite, que gobierna todo lo que se escribe aquí: está **medido** que
 * un conjunto encendido NO identifica su proceso —el solape entre ellos es del
 * 55–60 %, así que se encienden juntos—. Por eso ningún texto dice «tienes
 * inflamación». Lo que sí se puede afirmar, y es real, es que varios de sus
 * miembros **se movieron a la vez**, mucho más de lo que se movería un conjunto
 * sorteado al azar.
 */
export type Modulo = {
  /** El nombre técnico, tal como llega del pipeline. Es la clave. */
  tecnico: string;
  /** Cómo se titula de cara a quien lee. */
  humano: string;
  /** Nivel 2: qué es este conjunto, en una frase. */
  queEs: string;
  /** Nivel 2: qué implica que se mueva junto. */
  queImplica: string;
};

export const MODULOS: readonly Modulo[] = [
  {
    tecnico: "Inflamación aguda",
    humano: "Tu respuesta inflamatoria",
    queEs:
      "El grupo de reguladores que la sangre moviliza cuando el cuerpo responde a una agresión: una infección, una herida, un tejido irritado.",
    queImplica:
      "Que varios de ellos cambien a la vez sugiere una respuesta coordinada, no ruido suelto. No dice contra qué responde el cuerpo, ni si esa respuesta es buena o mala.",
  },
  {
    tecnico: "Reparación y remodelado",
    humano: "Reparación de tejidos",
    queEs:
      "Los reguladores implicados en reconstruir tejido: cerrar, cicatrizar y reorganizar lo que se ha dañado.",
    queImplica:
      "Un movimiento conjunto aquí acompaña a procesos de recuperación, pero también a remodelados crónicos. La señal no distingue entre curarse y desgastarse.",
  },
  {
    tecnico: "Estrés celular",
    humano: "Estrés de tus células",
    queEs:
      "La respuesta que activan las células cuando trabajan en condiciones difíciles: falta de oxígeno, exceso de demanda, daño acumulado.",
    queImplica:
      "Es un conjunto muy general: se mueve en casi cualquier situación exigente. Verlo activo dice que algo demanda a las células, no qué.",
  },
  {
    tecnico: "Regulación inmune",
    humano: "Equilibrio de tus defensas",
    queEs:
      "Los reguladores que suben y bajan el volumen del sistema inmune, para que responda lo justo y no de más.",
    queImplica:
      "Un cambio coordinado indica que el ajuste está en movimiento. No dice en qué dirección va el equilibrio ni si conviene.",
  },
  {
    tecnico: "Metabolismo",
    humano: "Cómo gestionas la energía",
    queEs:
      "Los reguladores del uso de combustible: cómo se produce, se guarda y se gasta la energía en los tejidos.",
    queImplica:
      "Que se mueva junto acompaña a cambios en la demanda energética. Es un fondo que se desplaza con muchas situaciones distintas.",
  },
] as const;

const PORCLAVE = new Map(MODULOS.map((m) => [m.tecnico, m]));

export function modulo(tecnico: string): Modulo {
  return (
    PORCLAVE.get(tecnico) ?? {
      tecnico,
      humano: tecnico,
      queEs: "Conjunto de reguladores agrupado por función biológica.",
      queImplica: "Su movimiento conjunto es una observación, no una conclusión.",
    }
  );
}
