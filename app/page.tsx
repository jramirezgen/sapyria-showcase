import { ArrowRight, FlaskConical, Layers, ShieldCheck } from "lucide-react";
import {
  Card, EvidenceBadge, Eyebrow, GhostLink, H2, Nota, PrimaryLink, Section, Shell, StatTile,
} from "@/components/ui/primitives";
import { cohortes, validacion } from "@/lib/showcase";

export default async function Home() {
  const [lista, val] = await Promise.all([cohortes(), validacion()]);
  const conSenal = lista.filter((c) => c.significativos > 0);
  const clases = new Set(lista.map((c) => c.clase));
  const nucleo = val.certificacion.trl?.trl_del_nucleo;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-20">
        <Shell>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <p className="ink-3 mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em]"
             style={{ borderColor: "var(--border)" }}>
            <i aria-hidden className="size-1.5 rounded-full" style={{ background: "var(--good)" }} />
            Plataforma de fenotipo molecular
          </p>
          <h1 className="balance max-w-3xl text-4xl font-extrabold leading-[1.03] tracking-[-0.04em] sm:text-6xl">
            Tu muestra.<br />
            <span style={{ color: "var(--accent)" }}>Tu mapa molecular.</span>
          </h1>
          <p className="ink-2 mt-6 max-w-2xl text-lg leading-relaxed pretty">
            Sapyria convierte una muestra de sangre en un <strong>fenotipo molecular
            de seis dimensiones</strong>, y cada una viaja con su nivel de evidencia.
            Lo que no se puede afirmar se dice antes que lo que sí.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryLink href="/demo">Ver la demo con datos reales <ArrowRight size={16} /></PrimaryLink>
            <GhostLink href="/como-funciona">Cómo funciona</GhostLink>
            <GhostLink href="/contacto">Hablar con Sapyria</GhostLink>
          </div>

        </div>

          {/* La salida real del producto, no un adorno. */}
          <Card className="w-full">
            <div className="flex items-center justify-between gap-3">
              <span className="ink-3 font-mono text-[11px] uppercase tracking-[0.14em]">
                Fenotipo molecular
              </span>
              <span className="ink-3 font-mono text-[11px]">ejemplo real</span>
            </div>
            <div className="mt-4 grid gap-2.5">
              {([
                ["Composición celular", "alta"],
                ["Regulación", "baja"],
                ["Conjuntos movidos", "sin-atribucion"],
                ["Procesos compatibles", "hipotesis"],
                ["Etapa", "no-evaluable"],
                ["Incertidumbre", "media"],
              ] as const).map(([dim, nivel]) => (
                <div key={dim} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 last:border-0 last:pb-0"
                     style={{ borderColor: "var(--border)" }}>
                  <span className="text-sm font-semibold">{dim}</span>
                  <EvidenceBadge nivel={nivel} />
                </div>
              ))}
            </div>
            <p className="ink-2 mt-4 text-xs leading-relaxed pretty">
              Seis dimensiones, cada una con su evidencia. Ninguna se presenta con
              más confianza de la que tiene.
            </p>
          </Card>
        </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile valor={lista.length} etiqueta="Cohortes públicas"
                      nota="Procesadas de punta a punta por el mismo pipeline." />
            <StatTile valor={clases.size} etiqueta="Clases de condición"
                      nota="Infecciosa, neurodegenerativa, oncológica e inmune." />
            <StatTile valor={conSenal.length} etiqueta="Con señal diferencial"
                      nota="En las demás no la hay, y también se publica." />
            <StatTile valor={nucleo ?? "—"} etiqueta="TRL del núcleo" tono="var(--accent)"
                      nota="Medido con rúbrica estándar, por componente." />
          </div>
        </Shell>
      </section>

      {/* ── La diferencia ────────────────────────────────────────────────── */}
      {/* ── El viaje de la muestra ───────────────────────────────────────
          Antes se pasaba directo del titular a la separación señal/contexto/
          límite, que es cierta pero es vocabulario de laboratorio. Quien llega
          por primera vez necesita entender QUÉ LE PASA A SU MUESTRA, sin saber
          biología, antes de que se le hable de rangos poblacionales. */}
      <Section>
        <Eyebrow>De la muestra a la interpretación</Eyebrow>
        <H2>Qué ocurre con tu sangre,<br />paso a paso.</H2>
        <p className="ink-2 mt-5 max-w-2xl text-base leading-relaxed pretty">
          No recibes una lista de datos. Recibes una lectura de cómo está organizado
          tu estado molecular ahora mismo, con lo que la sostiene y lo que no.
        </p>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Tu muestra", "Un tubo de sangre. Nada invasivo, nada que preparar."],
            ["Procesamiento", "Se leen los reguladores que circulan en ella: miles, en una sola pasada."],
            ["Análisis", "Se compara con personas de referencia para ver qué se aparta y cuánto."],
            ["Fenotipo molecular", "Lo que se aparta se organiza en conjuntos biológicos con sentido."],
            ["Interpretación", "Cada lectura viaja con su nivel de evidencia — y con su límite."],
          ].map(([titulo, texto], i) => (
            <li key={titulo} className="relative rounded-xl border p-5"
                style={{ borderColor: "var(--border)", background: "var(--surface-0)" }}>
              <span aria-hidden
                    className="grid size-7 place-items-center rounded-full font-mono text-xs font-bold"
                    style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
                {i + 1}
              </span>
              <h3 className="mt-3 text-base font-bold tracking-[-0.02em]">{titulo}</h3>
              <p className="ink-2 mt-1.5 text-sm leading-relaxed pretty">{texto}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tono="alt">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <Eyebrow>De archivo a contexto</Eyebrow>
            <H2>La secuenciación produce datos.<br />La interpretación empieza después.</H2>
            <p className="ink-2 mt-5 text-base leading-relaxed pretty">
              Un tamizaje útil no es el que señala más cosas: es el que sabe cuáles
              de sus señales se sostienen. Sapyria separa lo que <em>midió</em>, lo
              que <em>infiere</em> y lo que <em>no puede concluir</em> — y lo hace en
              la estructura del dato, no en una nota al pie.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              [FlaskConical, "Señal", "Qué se aparta del rango poblacional, en las dos direcciones y con su magnitud."],
              [Layers, "Contexto", "Composición celular, conjuntos moleculares y dianas con ensayo publicado detrás."],
              [ShieldCheck, "Límite", "Cuántas de esas señales aparecerían en una persona sana. Sin esa cifra, la primera no significa nada."],
            ].map(([Icono, titulo, texto]) => {
              const I = Icono as typeof FlaskConical;
              return (
                <Card key={titulo as string} className="flex gap-4">
                  <span aria-hidden className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg"
                        style={{ background: "var(--surface-2)", color: "var(--accent-strong)" }}>
                    <I size={18} />
                  </span>
                  <div>
                    <h3 className="text-base font-bold tracking-[-0.02em]">{titulo as string}</h3>
                    <p className="ink-2 mt-1 text-sm leading-relaxed pretty">{texto as string}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── Honestidad ───────────────────────────────────────────────────── */}
      <Section>
        <Eyebrow>Lo que casi nadie publica</Eyebrow>
        <H2 className="max-w-3xl">También publicamos lo que medimos<br />y <em>no</em> encontramos.</H2>
        <p className="ink-2 mt-5 max-w-2xl text-base leading-relaxed pretty">
          Tres capacidades se probaron con criterio declarado <strong>antes</strong> de
          mirar los resultados, y las tres fallaron su propio criterio. Están en la
          web con su causa medida, porque un sistema que sólo enseña sus aciertos no
          se puede auditar.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {val.modulos.slice(0, 1).map((m) => (
            <Card key={m.label}>
              <p className="ink-3 font-mono text-[11px] uppercase tracking-[0.14em]">Módulos</p>
              <p className="mt-2 text-base font-bold leading-snug">
                Un conjunto encendido <em>no</em> identifica su proceso
              </p>
              <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
                Medido sobre {m.condiciones_evaluadas} condiciones: ninguno responde en
                dos cohortes independientes de la misma clase.
              </p>
            </Card>
          ))}
          <Card>
            <p className="ink-3 font-mono text-[11px] uppercase tracking-[0.14em]">Etapa</p>
            <p className="mt-2 text-base font-bold leading-snug">La señal era el orden de procesamiento</p>
            <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
              Cinco ejes y tres diseños. Al retirar ese componente, la correlación con
              la fase cae a cero.
            </p>
          </Card>
          <Card>
            <p className="ink-3 font-mono text-[11px] uppercase tracking-[0.14em]">Referencia</p>
            <p className="mt-2 text-base font-bold leading-snug">La mayoría de señales mide el laboratorio</p>
            <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
              Por eso cada feature lleva cuánto de su variación es del paciente y
              cuánto del lote — y sólo los estables construyen el fenotipo.
            </p>
          </Card>
        </div>
        <div className="mt-8">
          <GhostLink href="/evidencia">Ver la evidencia completa <ArrowRight size={16} /></GhostLink>
        </div>
      </Section>

      {/* ── Cierre ───────────────────────────────────────────────────────── */}
      <Section tono="alt">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <Eyebrow>Explora ahora</Eyebrow>
            <H2>Una muestra.<br />Muchas preguntas bien planteadas.</H2>
            <div className="mt-7 flex flex-wrap gap-3">
              <PrimaryLink href="/demo">Abrir la demo <ArrowRight size={16} /></PrimaryLink>
              <GhostLink href="/contacto">Quiero conocer Sapyria</GhostLink>
              <GhostLink href="/login">Crear mi espacio</GhostLink>
            </div>
          </div>
          <Nota tono="aviso">
            <strong>Sapyria no emite diagnósticos.</strong> La demo pública corre sobre
            cohortes de acceso abierto y el espacio privado sobre una muestra sintética
            declarada. Ningún dato clínico real se publica en esta web.
          </Nota>
        </div>
      </Section>
    </>
  );
}
