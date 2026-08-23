/**
 * Los datos que la web muestra salen del pipeline REAL.
 *
 * `public/showcase/` lo genera `scripts/export_public_showcase.py` del
 * repositorio `smallrna-clinical-pipeline` desde los artefactos de las cohortes
 * públicas ya procesadas. Aquí no se calcula nada y no se inventa nada: si un
 * número no está en ese JSON, no se muestra.
 *
 * Antes de esto la web traía cifras fabricadas —módulos con puntajes 0,81 /
 * 0,74 / 0,62— que además contradecían lo que el pipeline midió: **un módulo
 * encendido no identifica su proceso**.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const RAIZ = path.join(process.cwd(), "public", "showcase");

export type Clase = "infecciosa" | "neurodegenerativa" | "oncológica" | "inmune";

export type CohorteResumen = {
  id: string;
  clase: Clase;
  titulo: string;
  contraste: string;
  universo: number;
  significativos: number;
  fraccion_significativa: number | null;
  figuras: number;
};

export type Feature = {
  id: string;
  efecto: number;
  q: number | null;
  direccion: string;
};

export type ModuloEnCohorte = {
  modulo: string;
  responde: boolean;
  p: number;
  percentil_vs_sorteados: number | null;
  miembros: number;
  veredicto_global: string;
  responde_en: number;
  de_condiciones: number;
};

export type Cohorte = {
  id: string;
  clase: Clase;
  titulo: string;
  contraste: string;
  resumen: string;
  expresion_diferencial: {
    universo: number;
    significativos: number;
    fraccion_significativa: number | null;
    al_alza: number;
    a_la_baja: number;
    top: Feature[];
  };
  modulos: ModuloEnCohorte[];
  figuras: { archivo: string; tipo: string }[];
};

export type Validacion = {
  modulos: {
    label: string;
    veredicto: string;
    responde_en: number;
    calla_en: number;
    condiciones_evaluadas: number;
    clases_reproducibles: string[];
  }[];
  certificacion: {
    veredicto?: string;
    criterios?: { criterio: string; cumple: boolean }[];
    trl?: {
      uso_declarado?: string;
      componentes?: { componente: string; trl: number; evidencia: string }[];
      trl_del_nucleo?: number;
      nota?: string;
    };
  };
};

async function leer<T>(...partes: string[]): Promise<T> {
  return JSON.parse(await readFile(path.join(RAIZ, ...partes), "utf8")) as T;
}

export async function cohortes(): Promise<CohorteResumen[]> {
  const { cohortes } = await leer<{ cohortes: CohorteResumen[] }>("cohorts", "index.json");
  return cohortes;
}

export async function cohorte(id: string): Promise<Cohorte> {
  return leer<Cohorte>("cohorts", `${id}.json`);
}

export async function validacion(): Promise<Validacion> {
  return leer<Validacion>("validation.json");
}

/** El color de serie de cada clase. Sigue a la ENTIDAD, nunca a su posición en
 *  una lista filtrada — un filtro que cambia el número de clases no puede
 *  repintar las que quedan. */
export const COLOR_CLASE: Record<Clase, string> = {
  infecciosa: "var(--series-1)",
  neurodegenerativa: "var(--series-7)",
  "oncológica": "var(--series-2)",
  inmune: "var(--series-3)",
};
