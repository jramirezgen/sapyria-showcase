import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { Card, Eyebrow, H2, Nota, Section, Shell } from "@/components/ui/primitives";
import { COLOR_CLASE, cohortes, type Clase } from "@/lib/showcase";

export const metadata: Metadata = {
  title: "Demo con datos públicos reales",
  description:
    "Ocho cohortes públicas procesadas por el pipeline de Sapyria. Sin cifras inventadas.",
};

const ORDEN: Clase[] = ["infecciosa", "neurodegenerativa", "oncológica", "inmune"];

export default async function DemoIndex() {
  const lista = await cohortes();
  const porClase = ORDEN.map((clase) => [clase, lista.filter((c) => c.clase === clase)] as const)
    .filter(([, cs]) => cs.length > 0);
  const maxFrac = Math.max(...lista.map((c) => c.fraccion_significativa ?? 0));

  return (
    <>
      <section className="pt-14 pb-8 sm:pt-20">
        <Shell>
          <Eyebrow>Demo sobre dato público</Eyebrow>
          <h1 className="balance max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Ocho cohortes reales,<br />procesadas por el mismo pipeline.
          </h1>
          <p className="ink-2 mt-6 max-w-2xl text-lg leading-relaxed pretty">
            Nada de esto está simulado. Son estudios de acceso abierto que este
            sistema procesó de punta a punta; verás <strong>lo que produce de
            verdad</strong>, incluidas las cohortes donde no encuentra nada.
          </p>
          <div className="mt-6">
            <Nota>
              Elige una condición para ver su fenotipo, su señal, sus conjuntos
              moleculares y —sobre todo— <strong>sus límites</strong>.
            </Nota>
          </div>
        </Shell>
      </section>

      {porClase.map(([clase, cs]) => (
        <Section key={clase} tono={ORDEN.indexOf(clase) % 2 === 0 ? "base" : "alt"}>
          <div className="mb-6 flex items-center gap-3">
            <i aria-hidden className="size-3 rounded-sm" style={{ background: COLOR_CLASE[clase] }} />
            <H2 className="!text-2xl">{clase[0].toUpperCase() + clase.slice(1)}</H2>
            <span className="ink-3 font-mono text-xs">{cs.length} cohorte{cs.length > 1 ? "s" : ""}</span>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {cs.map((c) => {
              const frac = c.fraccion_significativa ?? 0;
              return (
                <Card as="li" key={c.id} className="transition-shadow hover:shadow-md">
                  <Link href={`/demo/${c.id}`} className="block">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-lg font-bold tracking-[-0.02em]">{c.titulo}</h3>
                      <span className="ink-3 font-mono text-[11px]">{c.id}</span>
                    </div>
                    <p className="ink-2 mt-1 text-sm">{c.contraste}</p>

                    <div className="mt-4">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="ink-3 font-mono text-[11px] uppercase tracking-[0.12em]">
                          Señal diferencial
                        </span>
                        <span className="font-mono tabular-nums">
                          <strong>{c.significativos.toLocaleString("es")}</strong>
                          <span className="ink-3"> / {c.universo.toLocaleString("es")}</span>
                        </span>
                      </div>
                      {/* Barra fina, extremo redondeado, anclada al cero. */}
                      <div className="mt-2 h-2 w-full rounded-full" style={{ background: "var(--surface-2)" }}>
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${maxFrac > 0 ? Math.max(frac / maxFrac, frac > 0 ? 0.02 : 0) * 100 : 0}%`,
                            background: COLOR_CLASE[c.clase],
                          }}
                        />
                      </div>
                      <p className="ink-3 mt-2 text-xs">
                        {c.significativos === 0
                          ? "Sin señal detectable — y también se publica."
                          : `${(frac * 100).toFixed(1)} % del universo medido`}
                      </p>
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: "var(--accent)" }}>
                      Explorar <ArrowRight size={15} />
                    </span>
                  </Link>
                </Card>
              );
            })}
          </ul>
        </Section>
      ))}
    </>
  );
}
