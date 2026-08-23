"use client";

import { useState } from "react";
import { ChevronDown, Minus, Waves } from "lucide-react";
import { EvidenceBadge } from "@/components/ui/primitives";
import { modulo as textoDe } from "@/lib/modulos";

/**
 * Un conjunto biológico, en tres capas.
 *
 * Nivel 1 se lee de un vistazo y sin saber biología. Nivel 2 explica. Nivel 3
 * trae el dato duro **y su límite**. Las capas 2 y 3 nunca se abren solas: la
 * complejidad se ofrece, no se impone.
 *
 * El límite vive en el Nivel 3 a propósito, y no es un adorno: está medido que
 * estos conjuntos responden en varias condiciones distintas, así que ver uno
 * encendido no dice cuál. Esa frase se construye con las cifras reales
 * (`responde_en` de `de_condiciones`), no con una advertencia genérica.
 */
export type DatosModulo = {
  modulo: string;
  responde: boolean;
  percentil_vs_sorteados: number;
  miembros: number;
  responde_en: number;
  de_condiciones: number;
};

export function ModuloCard({ d }: { d: DatosModulo }) {
  const [abierto, setAbierto] = useState(false);
  const t = textoDe(d.modulo);
  const idPanel = `modulo-${d.modulo.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="rounded-xl border transition-colors"
         style={{ borderColor: "var(--border)", background: "var(--surface-0)" }}>
      {/* ── Nivel 1 ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start gap-4 p-5">
        <span aria-hidden className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg"
              style={{
                background: d.responde ? "color-mix(in oklab, var(--accent) 14%, transparent)" : "var(--surface-2)",
                color: d.responde ? "var(--accent-strong)" : "var(--ink-3)",
              }}>
          {d.responde ? <Waves size={19} /> : <Minus size={19} />}
        </span>

        <div className="min-w-[12rem] flex-1">
          <h3 className="text-[17px] font-bold leading-tight tracking-[-0.01em]">{t.humano}</h3>
          <p className="ink-3 mt-0.5 font-mono text-[11px] tracking-[0.06em]">{t.tecnico}</p>
          <p className="ink-2 mt-2 text-sm leading-snug pretty">
            {d.responde
              ? "Varios de sus reguladores se movieron a la vez."
              : "Sin movimiento coordinado en este perfil."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge nivel={d.responde ? "sin-atribucion" : "sin-senal"} />
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls={idPanel}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderColor: "var(--border)" }}
          >
            {abierto ? "Menos" : "Saber más"}
            <ChevronDown size={15} className={abierto ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
        </div>
      </div>

      {/* ── Niveles 2 y 3 ───────────────────────────────────────────────── */}
      {abierto ? (
        <div id={idPanel} className="border-t px-5 pb-5 pt-4" style={{ borderColor: "var(--border)" }}>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="ink-3 font-mono text-[10px] uppercase tracking-[0.14em]">Qué es</p>
              <p className="ink-2 mt-1.5 text-sm leading-relaxed pretty">{t.queEs}</p>
              <p className="ink-3 mt-3 font-mono text-[10px] uppercase tracking-[0.14em]">Qué implica</p>
              <p className="ink-2 mt-1.5 text-sm leading-relaxed pretty">{t.queImplica}</p>
            </div>

            <div className="rounded-lg p-4" style={{ background: "var(--surface-1)" }}>
              <p className="ink-3 font-mono text-[10px] uppercase tracking-[0.14em]">El dato</p>
              <dl className="mt-2 grid gap-1.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="ink-2">Reguladores en el conjunto</dt>
                  <dd className="font-mono font-semibold">{d.miembros}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="ink-2">Frente a conjuntos al azar</dt>
                  <dd className="font-mono font-semibold">percentil {Math.round(d.percentil_vs_sorteados)}</dd>
                </div>
              </dl>
              <p className="mt-3 border-t pt-3 text-sm leading-relaxed pretty"
                 style={{ borderColor: "var(--border)" }}>
                <strong>Lo que esto no dice.</strong>{" "}
                Este mismo conjunto se mueve en <strong>{d.responde_en} de {d.de_condiciones}</strong>{" "}
                condiciones distintas que hemos medido. Verlo activo indica que algo lo
                está moviendo — no permite decir <em>qué</em>.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
