import type { Metadata } from "next";
import { Card, Eyebrow, H2, Nota, Section, Shell } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Sobre Sapyria",
  description: "Cómo trabajamos: procedencia, compuertas y resultados negativos publicados.",
};

export default function Sobre() {
  return (
    <>
      <section className="pt-14 pb-8 sm:pt-20">
        <Shell>
          <Eyebrow>Sobre Sapyria</Eyebrow>
          <h1 className="balance max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Un resultado vale lo que<br />vale su procedencia.
          </h1>
          <p className="ink-2 mt-6 max-w-2xl text-lg leading-relaxed pretty">
            Sapyria es una plataforma de interpretación molecular con sede en Lima.
            Trabajamos sobre una premisa incómoda: la mayor parte del valor está en
            saber qué <em>no</em> se puede afirmar.
          </p>
        </Shell>
      </section>

      <Section tono="alt">
        <H2 className="max-w-3xl">Cómo trabajamos</H2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["El criterio se escribe antes",
             "Cada capacidad se evalúa con un criterio declarado y fechado antes de mirar los resultados. Si falla, se publica que falló — ya ocurrió varias veces."],
            ["Ninguna cifra a mano",
             "Todo número que publicamos sale de un script que se puede volver a correr. Un dato escrito a mano se desincroniza en silencio."],
            ["Una sola definición de «verde»",
             "Un conjunto de compuertas decide si el sistema está en condiciones. No hay una segunda opinión más cómoda."],
            ["Lo no medido no es lo mismo que lo negativo",
             "«No lo pudimos evaluar» y «lo evaluamos y no está» son estados distintos y viajan por separado en cada resultado."],
          ].map(([t, d]) => (
            <Card key={t}>
              <h3 className="text-base font-bold tracking-[-0.02em]">{t}</h3>
              <p className="ink-2 mt-2 text-sm leading-relaxed pretty">{d}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <H2 className="max-w-3xl">Fronteras de datos</H2>
        <div className="mt-6 grid gap-3">
          {[
            ["Esta web", "Resultados agregados y públicos. Cero dato ómico primario, cero identificadores de casos."],
            ["Infraestructura controlada", "FASTQ, BAM, VCF, informes y todo artefacto pesado. No sale de ahí."],
            ["Espacio privado", "Cuenta, estado de muestra y una muestra sintética declarada como tal."],
          ].map(([donde, que]) => (
            <div key={donde} className="flex flex-wrap gap-x-4 gap-y-1 border-b pb-3 last:border-0"
                 style={{ borderColor: "var(--border)" }}>
              <strong className="min-w-[14rem] text-sm">{donde}</strong>
              <span className="ink-2 flex-1 text-sm leading-snug pretty">{que}</span>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Nota tono="aviso">
            <strong>Sapyria no emite diagnósticos ni valida condiciones clínicas.</strong>{" "}
            La validación clínica no es un objetivo declarado de esta plataforma, y no
            se presenta como si lo fuera.
          </Nota>
        </div>
      </Section>

      <Section tono="alt">
        <H2>Hablemos</H2>
        <p className="ink-2 mt-4 max-w-xl leading-relaxed pretty">
          Si trabajas con cohortes propias o quieres entender si esto encaja en tu
          proceso, escríbenos.
        </p>
        <a href="mailto:hola@sapyria.com"
           className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white"
           style={{ background: "var(--accent)" }}>
          hola@sapyria.com
        </a>
      </Section>
    </>
  );
}
