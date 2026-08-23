import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import { Card, Eyebrow, H2, Nota, Section, Shell, StatTile } from "@/components/ui/primitives";
import { validacion } from "@/lib/showcase";

export const metadata: Metadata = {
  title: "Evidencia y límites",
  description:
    "Certificación medida, TRL por componente y lo que se midió y NO se encontró.",
};

export default async function Evidencia() {
  const v = await validacion();
  const cert = v.certificacion;
  const comps = cert.trl?.componentes ?? [];
  const nucleo = cert.trl?.trl_del_nucleo;

  return (
    <>
      <section className="pt-14 pb-8 sm:pt-20">
        <Shell>
          <Eyebrow>Evidencia</Eyebrow>
          <h1 className="balance max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Lo que sostiene cada afirmación —<br />y lo que no la sostiene.
          </h1>
          <p className="ink-2 mt-6 max-w-2xl text-lg leading-relaxed pretty">
            Todo lo de esta página se <strong>mide</strong>, no se declara. Cada
            criterio y cada nivel de madurez sale de un script que se vuelve a
            correr y vuelve a dar el mismo resultado.
          </p>
        </Shell>
      </section>

      {/* ── Certificación ────────────────────────────────────────────────── */}
      <Section tono="alt">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div>
            <Eyebrow>Certificación de lanzamiento</Eyebrow>
            <H2>Nueve criterios,<br />comprobados uno a uno.</H2>
            <p className="ink-2 mt-5 leading-relaxed pretty">
              Un checklist en prosa se firma una vez y se desactualiza en silencio.
              Éste es un programa: si algo deja de cumplirse, lo dice.
            </p>
            {cert.veredicto ? (
              <p className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-sm font-semibold"
                 style={{ background: "color-mix(in oklab, var(--good) 14%, transparent)", color: "var(--good)" }}>
                <Check size={16} /> {cert.veredicto.replaceAll("_", " ")}
              </p>
            ) : null}
          </div>
          <ul className="grid gap-2">
            {(cert.criterios ?? []).map((c) => (
              <li key={c.criterio}
                  className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
                  style={{ borderColor: "var(--border)", background: "var(--surface-0)" }}>
                <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full"
                      style={{ background: c.cumple ? "var(--good)" : "var(--critical)", color: "var(--on-status)" }}>
                  {c.cumple ? <Check size={12} /> : <X size={12} />}
                </span>
                <span className="flex-1">{c.criterio}</span>
                <span className="ink-3 font-mono text-[11px] uppercase">
                  {c.cumple ? "cumple" : "no cumple"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── TRL ──────────────────────────────────────────────────────────── */}
      <Section>
        <Eyebrow>Madurez tecnológica</Eyebrow>
        <H2 className="max-w-3xl">Un número solo escondería lo importante.</H2>
        <p className="ink-2 mt-5 max-w-2xl leading-relaxed pretty">
          La rúbrica estándar es explícita: el nivel real es el del componente
          <em> más bajo</em> entre los que sostienen la propuesta de valor, y hay que
          reportarlos por separado. Publicar uno agregado es su propia señal de alarma.
        </p>

        <ul className="mt-8 grid gap-3">
          {comps.map((c) => (
            <Card as="li" key={c.componente}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <strong className="text-base">{c.componente}</strong>
                <span className="font-mono text-2xl font-extrabold tabular-nums"
                      style={{ color: c.trl >= 5 ? "var(--good)" : c.trl >= 4 ? "var(--warning)" : "var(--serious)" }}>
                  TRL {c.trl}
                </span>
              </div>
              {/* Escala fija 1–9: la barra compara contra el máximo posible, no
                  contra el mayor de la lista — así un componente bajo se ve bajo. */}
              <div className="mt-3 flex gap-1" aria-hidden>
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="h-1.5 flex-1 rounded-full"
                        style={{ background: i < c.trl
                          ? (c.trl >= 5 ? "var(--good)" : c.trl >= 4 ? "var(--warning)" : "var(--serious)")
                          : "var(--surface-2)" }} />
                ))}
              </div>
              <p className="ink-2 mt-3 text-sm leading-relaxed pretty">{c.evidencia}</p>
            </Card>
          ))}
        </ul>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <StatTile valor={nucleo ?? "—"} etiqueta="TRL del núcleo" tono="var(--accent)"
                    nota="Demostrado en condiciones reales de uso, con un cliente real." />
          <Nota tono="aviso">
            <strong>No afirmamos TRL 7.</strong> Exige el sistema completo
            <em> operando</em> de forma continua, no una entrega procesada. Cuando eso
            ocurra, se medirá otra vez.
          </Nota>
        </div>
      </Section>

      {/* ── Lo no encontrado ─────────────────────────────────────────────── */}
      <Section tono="alt">
        <Eyebrow>Resultados negativos</Eyebrow>
        <H2 className="max-w-3xl">Lo que medimos y no encontramos.</H2>
        <p className="ink-2 mt-5 max-w-2xl leading-relaxed pretty">
          Cada uno se probó con el criterio escrito <strong>antes</strong> de mirar.
          Publicarlos es lo que hace auditable todo lo demás.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Conjuntos moleculares y su reproducibilidad</caption>
            <thead>
              <tr className="ink-3 text-left font-mono text-[11px] uppercase tracking-[0.1em]">
                <th scope="col" className="py-2 pr-4">Conjunto</th>
                <th scope="col" className="py-2 pr-4 text-right">Responde</th>
                <th scope="col" className="py-2 pr-4 text-right">Calla</th>
                <th scope="col" className="py-2 pr-4">Reproducible en</th>
                <th scope="col" className="py-2">Veredicto</th>
              </tr>
            </thead>
            <tbody>
              {v.modulos.map((m) => (
                <tr key={m.label} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-3 pr-4 font-medium">{m.label}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">
                    {m.responde_en}<span className="ink-3">/{m.condiciones_evaluadas}</span>
                  </td>
                  <td className="ink-2 py-3 pr-4 text-right tabular-nums">{m.calla_en}</td>
                  <td className="ink-2 py-3 pr-4">
                    {m.clases_reproducibles.length ? m.clases_reproducibles.join(", ") : "ninguna clase"}
                  </td>
                  <td className="py-3">
                    <span className="font-mono text-[11px] tracking-[0.06em]"
                          style={{ color: m.veredicto === "REPRODUCIBLE" ? "var(--good)" : "var(--serious)" }}>
                      {m.veredicto}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <h3 className="text-base font-bold">Los conjuntos no discriminan</h3>
            <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
              Comparten la mayor parte de sus miembros, así que se encienden juntos.
              No es que no distingan procesos: <strong>no pueden</strong>.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-bold">La etapa era el orden</h3>
            <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
              El índice correlacionaba con la fase de la enfermedad. Al retirar el
              efecto del orden de procesamiento, esa correlación desapareció entera.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-bold">Qué haría falta</h3>
            <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
              Muestras del <strong>mismo protocolo</strong> y operación continua. No lo
              sustituye ninguna capa de análisis nueva, y está medido cuánto valen.
            </p>
          </Card>
        </div>
      </Section>

      {/* ── Lo que se preguntó y no se pudo ────────────────────────────────
          Publicar esto es la parte que casi nadie hace, y es exactamente lo que
          distingue un tamizaje honesto de uno que promete. Las cifras salen del
          estudio pre-registrado de agosto de 2026 sobre 16 761 muestras de 57
          tejidos: docs/00_GOBIERNO/65_RESULTADO_EJES_ROBUSTOS.md. */}
      <Section>
        <Eyebrow>Preguntas cerradas con una cifra</Eyebrow>
        <H2>Lo que nos preguntamos<br />y no se puede leer.</H2>
        <p className="ink-2 mt-5 max-w-2xl text-base leading-relaxed pretty">
          Si esto describe tu estado molecular, ¿puede decir tu sexo, tu edad, tus
          alergias? Se respondió midiéndolo sobre <strong>16 761 muestras de 57
          tejidos</strong>, con el protocolo escrito antes de mirar ningún resultado.
          Ninguna de estas preguntas superó el listón, y por eso ninguna aparece en
          un informe.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="text-base font-bold">Sexo — real, y demasiado débil</h3>
            <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
              La señal existe y <strong>se repite en 44 tejidos distintos</strong>, así
              que es biología y no un artefacto. Pero acierta 0,66 de 1: poco más que
              lanzar una moneda cargada. El motivo es de fondo —
              <strong>el cromosoma Y no contiene ni un solo miRNA</strong>—, así que no
              hay método que lo levante.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-bold">Edad — era el laboratorio</h3>
            <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
              La correlación cruda parecía buena (0,34). Al descontar cuánto tardó cada
              muestra en procesarse, <strong>bajó a 0,13</strong>. Lo que parecía edad
              era, en buena parte, el tiempo que la muestra pasó esperando.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-bold">Origen del tejido — la trampa</h3>
            <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
              Nuestra referencia acierta el tejido de una muestra pura el{" "}
              <strong>95,5 %</strong> de las veces. Invita a venderlo. Pero al mezclar
              una fracción conocida en sangre, <strong>por debajo del 20 % es
              completamente ciega</strong>. Saber clasificar un tejido no es saber
              detectarlo dentro de la sangre.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-bold">Alergias — el panel no es de alergias</h3>
            <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
              Los miRNA que la literatura asocia a enfermedad alérgica están asociados,
              cada uno, a una mediana de <strong>58 enfermedades distintas</strong>;
              uno al azar, a 3,5. No son marcadores de alergia: son los más estudiados,
              y aparecen en todo.
            </p>
          </Card>
        </div>

        <div className="mt-6">
          <Nota tono="aviso">
            <strong>Y dos que ni se intentaron.</strong> La ancestría exige variantes
            heredadas del ADN, y esto mide <em>expresión</em> — que cambia con la hora
            del día y con la última comida. La personalidad y los gustos no tienen
            base biológica establecida en lo que circula por la sangre. Decir lo
            contrario sería vender humo, y preferimos decirlo aquí.
          </Nota>
        </div>
      </Section>

    </>
  );
}
