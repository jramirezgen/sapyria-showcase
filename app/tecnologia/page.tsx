import type { Metadata } from "next";
import { Card, Eyebrow, H2, Nota, Section, Shell } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Tecnología",
  description: "small RNA-seq, WES y WGS — cada capa con su alcance real.",
};

const CAPAS = [
  { n: "01", t: "small RNA-seq", estado: "En producción",
    color: "var(--good)",
    d: "La capa madura. Una muestra de sangre total produce un perfil de RNA pequeño que se compara contra un panel de donantes vivos, con su especificidad medida y publicada en cada corrida.",
    hechos: ["Panel de referencia sólo de donantes vivos",
             "Dos métricas: magnitud y dirección",
             "Nivel de evidencia por feature",
             "Certificación medida, no declarada"] },
  { n: "02", t: "Whole Exome Sequencing", estado: "En desarrollo",
    color: "var(--warning)",
    d: "Prioriza variantes codificantes con su calidad y la evidencia disponible. Su gobierno de datos comparte disciplina con el flujo de small RNA: contrato de entrada, procedencia y compuerta.",
    hechos: ["Contrato de entrada declarado", "Procedencia por artefacto", "Revisión humana en el circuito"] },
  { n: "03", t: "Whole Genome Sequencing", estado: "Exploratorio",
    color: "var(--serious)",
    d: "Amplía el contexto genómico dentro del alcance que cada piloto puede sostener. No se promete cobertura que no esté demostrada.",
    hechos: ["Alcance por piloto", "Sin promesas de cobertura no demostrada"] },
] as const;

export default function Tecnologia() {
  return (
    <>
      <section className="pt-14 pb-8 sm:pt-20">
        <Shell>
          <Eyebrow>Capas analíticas</Eyebrow>
          <h1 className="balance max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            La pregunta define<br />la tecnología.
          </h1>
          <p className="ink-2 mt-6 max-w-2xl text-lg leading-relaxed pretty">
            Tres capas con grados de madurez distintos. Decirlo así es parte del
            producto: una plataforma que presenta todo como igual de listo no se
            puede evaluar.
          </p>
        </Shell>
      </section>

      <Section tono="alt">
        <ul className="grid gap-4">
          {CAPAS.map((c) => (
            <Card as="li" key={c.t}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="ink-3 font-mono text-sm">{c.n}</span>
                <h2 className="text-xl font-bold tracking-[-0.02em]">{c.t}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] tracking-[0.1em]"
                      style={{ borderColor: "var(--border)" }}>
                  <i aria-hidden className="size-2 rounded-full" style={{ background: c.color }} />
                  {c.estado.toUpperCase()}
                </span>
              </div>
              <p className="ink-2 mt-3 max-w-3xl text-sm leading-relaxed pretty">{c.d}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {c.hechos.map((h) => (
                  <li key={h} className="ink-2 rounded-md px-3 py-1.5 text-xs"
                      style={{ background: "var(--surface-2)" }}>{h}</li>
                ))}
              </ul>
            </Card>
          ))}
        </ul>
      </Section>

      <Section>
        <H2 className="max-w-3xl">Dónde vive cada cosa</H2>
        <p className="ink-2 mt-5 max-w-2xl leading-relaxed pretty">
          Los datos ómicos pesados —FASTQ, BAM, VCF completos— no salen de la
          infraestructura controlada. Esta web consume resultados agregados y
          públicos, nunca dato primario ni identificadores de casos.
        </p>
        <div className="mt-6">
          <Nota>
            La demo de esta web corre sobre estudios de acceso abierto del repositorio
            público GEO. Puedes verificar cada accesión por tu cuenta.
          </Nota>
        </div>
      </Section>
    </>
  );
}
