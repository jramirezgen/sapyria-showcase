import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import {
  Card, Eyebrow, EvidenceBadge, Nota, Shell, StatTile,
} from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/tabs";
import { FiguraPipeline } from "@/components/ui/figure";
import { COLOR_CLASE, cohorte, cohortes } from "@/lib/showcase";

export async function generateStaticParams() {
  return (await cohortes()).map((c) => ({ cohorte: c.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ cohorte: string }> },
): Promise<Metadata> {
  const { cohorte: id } = await params;
  try {
    const c = await cohorte(id);
    return { title: `${c.titulo} — demo`, description: `${c.contraste}. ${c.resumen}` };
  } catch {
    return { title: "Cohorte no encontrada" };
  }
}

const PIE: Record<string, string> = {
  volcano: "Cada punto es un miRNA: a la derecha los que suben, a la izquierda los que bajan, y más arriba cuanto menor es su p. Generado por el pipeline a 300 dpi.",
  pca: "Las muestras proyectadas sobre sus dos primeras componentes. Si los grupos no se separan aquí, la señal es sutil — y eso también informa.",
  abundance: "Los miRNA más abundantes, muestra a muestra. Sirve para ver estructura y también lotes.",
  reference: "Estabilidad del grupo de referencia: cuánto varía cada feature entre las muestras control.",
};

export default async function CohortePage({ params }: { params: Promise<{ cohorte: string }> }) {
  const { cohorte: id } = await params;
  let c;
  try {
    c = await cohorte(id);
  } catch {
    notFound();
  }

  const de = c.expresion_diferencial;
  const haySenal = de.significativos > 0;
  const respondiendo = c.modulos.filter((m) => m.responde);

  return (
    <>
      <section className="pt-10 pb-6">
        <Shell>
          <Link href="/demo" className="ink-2 inline-flex items-center gap-1.5 text-sm font-medium">
            <ArrowLeft size={15} /> Todas las cohortes
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <i aria-hidden className="size-3 rounded-sm" style={{ background: COLOR_CLASE[c.clase] }} />
            <span className="ink-3 font-mono text-[11px] uppercase tracking-[0.14em]">{c.clase}</span>
            <span className="ink-3 font-mono text-[11px]">· {c.id}</span>
          </div>
          <h1 className="balance mt-2 text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            {c.titulo}
          </h1>
          <p className="ink-2 mt-3 text-lg">{c.contraste}</p>
          <p className="ink-2 mt-4 max-w-2xl leading-relaxed pretty">{c.resumen}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile valor={de.universo.toLocaleString("es")} etiqueta="Features medidos" />
            <StatTile
              valor={de.significativos.toLocaleString("es")}
              etiqueta="Con señal"
              tono={haySenal ? COLOR_CLASE[c.clase] : "var(--ink-3)"}
              nota={haySenal ? `${((de.fraccion_significativa ?? 0) * 100).toFixed(1)} % del universo` : "Ninguno supera la corrección"}
            />
            <StatTile valor={de.al_alza.toLocaleString("es")} etiqueta="Al alza" />
            <StatTile valor={de.a_la_baja.toLocaleString("es")} etiqueta="A la baja"
                      nota="Detectarlas exige una métrica propia; no salen de la magnitud." />
          </div>
        </Shell>
      </section>

      <Shell className="pb-20">
        <Tabs
          items={[
            {
              id: "senal", label: "Señal",
              content: (
                <div className="space-y-6">
                  {!haySenal ? (
                    <Nota tono="aviso">
                      <strong>Esta cohorte no tiene señal diferencial detectable.</strong> No
                      se fuerza una interpretación: ninguna prueba de enriquecimiento
                      puede decir nada sobre cero features, y presentarlo de otro modo
                      sería inventar.
                    </Nota>
                  ) : null}
                  {haySenal ? (
                    <Card>
                      <Eyebrow>Los más apartados</Eyebrow>
                      <p className="ink-2 mb-1 text-sm leading-relaxed pretty">
                        Ordenados por <strong>magnitud del efecto</strong>, no por su{" "}
                        <span className="font-mono">q</span>. Algunos no sobreviven a la
                        corrección por comparaciones múltiples y van marcados: el
                        gradiente completo informa más que una lista recortada, pero
                        sólo si se ve dónde está el corte.
                      </p>
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-sm">
                          <caption className="sr-only">
                            miRNA con mayor tamaño de efecto en {c.contraste}
                          </caption>
                          <thead>
                            <tr className="ink-3 text-left font-mono text-[11px] uppercase tracking-[0.1em]">
                              <th scope="col" className="py-2 pr-3">miRNA</th>
                              <th scope="col" className="py-2 pr-3 text-right">Efecto</th>
                              <th scope="col" className="py-2 pr-3 text-right">q</th>
                              <th scope="col" className="py-2 pr-3">Dirección</th>
                              <th scope="col" className="py-2">Tras corrección</th>
                            </tr>
                          </thead>
                          <tbody>
                            {de.top.map((f) => (
                              <tr key={f.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                                <td className="py-2 pr-3 font-mono text-[13px]">{f.id}</td>
                                <td className="py-2 pr-3 text-right tabular-nums">{f.efecto.toFixed(2)}</td>
                                <td className="ink-2 py-2 pr-3 text-right tabular-nums">
                                  {f.q === null ? "—" : f.q.toExponential(1)}
                                </td>
                                <td className="py-2 pr-3">
                                  <span className="inline-flex items-center gap-1.5 text-[13px]">
                                    <i aria-hidden className="size-2 rounded-full"
                                       style={{ background: f.direccion === "INCREASED" ? "var(--series-2)" : "var(--series-1)" }} />
                                    {f.direccion === "INCREASED" ? "sube" : "baja"}
                                  </span>
                                </td>
                                {/* Ordenar por magnitud del efecto mete en la tabla
                                    features que NO sobreviven a la corrección por
                                    comparaciones múltiples. Se conservan —el
                                    gradiente informa— pero se marcan: sin esta
                                    columna, un q de 0,55 se lee como un hallazgo. */}
                                <td className="py-2">
                                  {f.q !== null && f.q < 0.05 ? (
                                    <span className="font-mono text-[11px]" style={{ color: "var(--good)" }}>
                                      significativo
                                    </span>
                                  ) : (
                                    <span className="ink-3 font-mono text-[11px]">no significativo</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  ) : null}
                  {c.figuras.filter((f) => f.tipo === "volcano" || f.tipo === "pca").map((f) => (
                    <FiguraPipeline key={f.archivo} src={f.archivo}
                                    alt={`${PIE[f.tipo] ?? f.tipo} — ${c.titulo}`}
                                    pie={PIE[f.tipo] ?? f.tipo} />
                  ))}
                </div>
              ),
            },
            {
              id: "modulos", label: "Conjuntos moleculares",
              content: (
                <div className="space-y-6">
                  <Nota tono="aviso">
                    <strong>Un conjunto encendido no identifica su proceso.</strong> Se
                    midió sobre las ocho condiciones: ninguno responde en dos cohortes
                    independientes de la misma clase, y cuando responden lo hacen en
                    bloque. Lo que la evidencia sostiene es <em>«varios miRNA de este
                    conjunto se movieron juntos»</em> — no el proceso que le da nombre.
                  </Nota>
                  {c.modulos.length === 0 ? (
                    <p className="ink-2">Sin señal suficiente para evaluar conjuntos en esta cohorte.</p>
                  ) : (
                    <ul className="grid gap-3">
                      {c.modulos.map((m) => (
                        <Card as="li" key={m.modulo} className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <strong className="text-base">{m.modulo}</strong>
                              <EvidenceBadge nivel={m.responde ? "sin-atribucion" : "no-evaluable"} />
                            </div>
                            <p className="ink-2 mt-1 text-sm">
                              {m.miembros} miembros medidos ·{" "}
                              {m.responde ? "se mueve más que el fondo" : "no se distingue del fondo"}
                              {m.percentil_vs_sorteados !== null
                                ? ` · percentil ${m.percentil_vs_sorteados} frente a conjuntos sorteados`
                                : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="ink-3 font-mono text-[11px] uppercase tracking-[0.1em]">p</p>
                            <p className="font-mono tabular-nums">{m.p < 0.0001 ? m.p.toExponential(0) : m.p.toFixed(4)}</p>
                            <p className="ink-3 mt-1 text-[11px]">
                              responde en {m.responde_en}/{m.de_condiciones}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </ul>
                  )}
                  {respondiendo.length >= 4 ? (
                    <Nota>
                      En esta cohorte responden <strong>{respondiendo.length} de {c.modulos.length}</strong> conjuntos
                      a la vez. Eso es exactamente el patrón que impide atribuirle un
                      proceso concreto: se mueven juntos porque comparten buena parte de
                      sus miembros.
                    </Nota>
                  ) : null}
                </div>
              ),
            },
            {
              id: "estructura", label: "Estructura",
              content: (
                <div className="space-y-6">
                  {c.figuras.filter((f) => f.tipo === "abundance" || f.tipo === "reference").length === 0 ? (
                    <p className="ink-2">Esta cohorte no tiene figuras de estructura generadas.</p>
                  ) : null}
                  {c.figuras.filter((f) => f.tipo === "abundance" || f.tipo === "reference").map((f) => (
                    <FiguraPipeline key={f.archivo} src={f.archivo}
                                    alt={`${PIE[f.tipo] ?? f.tipo} — ${c.titulo}`}
                                    pie={PIE[f.tipo] ?? f.tipo} />
                  ))}
                </div>
              ),
            },
            {
              id: "limites", label: "Límites",
              content: (
                <div className="grid gap-4">
                  <Nota tono="aviso">
                    <strong>Esto no es un diagnóstico.</strong> Es un tamizaje que reduce
                    el espacio de búsqueda: señala dónde mirar y, sobre todo, dónde no
                    hace falta.
                  </Nota>
                  <Card>
                    <h3 className="text-base font-bold">Qué no se puede decir con este dato</h3>
                    <ul className="ink-2 mt-3 space-y-2 text-sm leading-relaxed">
                      <li>· Que un miRNA apartado <em>cause</em> nada: es una asociación en una cohorte.</li>
                      <li>· Que un conjunto encendido señale su proceso — está medido que no.</li>
                      <li>· En qué <em>fase</em> está una muestra: se probó en cinco ejes y no se sostuvo.</li>
                      <li>· Nada sobre una persona concreta. Son cohortes públicas agregadas.</li>
                    </ul>
                  </Card>
                  <Card>
                    <h3 className="text-base font-bold">Procedencia</h3>
                    <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
                      Estudio <span className="font-mono">{c.id}</span> del repositorio público GEO,
                      reprocesado por el pipeline de Sapyria con su contrato de tablas,
                      su manifiesto de referencias y su compuerta. Ninguna cifra de esta
                      página se escribió a mano.
                    </p>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </Shell>
    </>
  );
}
