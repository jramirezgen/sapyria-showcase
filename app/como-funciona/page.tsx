import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Card, Eyebrow, EvidenceBadge, GhostLink, H2, Nota, PrimaryLink, Section, Shell } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "De una muestra de sangre a un fenotipo molecular de seis dimensiones.",
};

const PASOS = [
  ["01", "Ingesta con contrato",
   "La entrega del laboratorio entra sólo si sus tablas cumplen un contrato declarado: qué columna es qué, en qué unidad y con qué diccionario. Sin diccionario confirmado, el flujo no deriva nada — prefiere bloquearse a inventar."],
  ["02", "Identidad resuelta",
   "Cada identificador se resuelve contra miRBase con su historial de nombres. Un nombre que no resuelve se marca como medido-sin-identidad, que no es lo mismo que no medido."],
  ["03", "Comparación contra referencia",
   "La muestra se compara contra un panel de donantes vivos. Dos métricas: una dice CUÁNTO se aparta, la otra EN QUÉ DIRECCIÓN — y sólo la segunda puede detectar una disminución."],
  ["04", "Cuánto es el laboratorio",
   "Cada feature lleva qué parte de su variación es entre personas y cuál entre laboratorios. Sólo los estables construyen el fenotipo; el resto va al anexo, con su aviso."],
  ["05", "Capa funcional graduada",
   "Las dianas provienen de ensayos publicados con su PMID. Un miRNA alterado no es una función alterada, y la estructura del dato lo refleja: cada proceso llega marcado como hipótesis."],
  ["06", "El fenotipo, con su evidencia",
   "Seis dimensiones, cada una con su nivel. Y arriba del todo, cuántas de esas señales aparecerían en una persona sana — sin esa cifra, el resto no significa nada."],
] as const;

export default function ComoFunciona() {
  return (
    <>
      <section className="pt-14 pb-8 sm:pt-20">
        <Shell>
          <Eyebrow>El enfoque</Eyebrow>
          <h1 className="balance max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            De una muestra de sangre<br />a un fenotipo molecular.
          </h1>
          <p className="ink-2 mt-6 max-w-2xl text-lg leading-relaxed pretty">
            Seis pasos, cada uno con una compuerta que puede detener el flujo. Un
            resultado que llega hasta el final ha pasado por todas.
          </p>
        </Shell>
      </section>

      <Section tono="alt">
        <ol className="grid gap-4 md:grid-cols-2">
          {PASOS.map(([n, titulo, texto]) => (
            <Card as="li" key={n}>
              <span className="ink-3 font-mono text-sm font-medium">{n}</span>
              <h3 className="mt-1 text-lg font-bold tracking-[-0.02em]">{titulo}</h3>
              <p className="ink-2 mt-2 text-sm leading-relaxed pretty">{texto}</p>
            </Card>
          ))}
        </ol>
      </Section>

      <Section>
        <Eyebrow>La salida</Eyebrow>
        <H2 className="max-w-3xl">Un fenotipo, no una lista de miRNA.</H2>
        <p className="ink-2 mt-5 max-w-2xl leading-relaxed pretty">
          El informe abre con las seis dimensiones y su evidencia. Las condiciones
          clínicas, si aparecen, van al final y como interpretación opcional: el
          fenotipo se sostiene sin ellas.
        </p>
        <Card className="mt-8">
          <div className="grid gap-3">
            {[
              ["Composición celular", "alta", "Marcadores de linaje contrastados contra dos atlas independientes."],
              ["Regulación", "baja", "Cuántos features se apartan, al alza y a la baja."],
              ["Conjuntos movidos", "sin-atribucion", "Qué conjuntos se movieron — sin atribuirles su proceso."],
              ["Procesos compatibles", "hipotesis", "Inferidos desde dianas con ensayo publicado. Nunca observados aquí."],
              ["Etapa", "no-evaluable", "Medida y no encontrada sobre cinco ejes clínicos."],
              ["Incertidumbre", "media", "Qué no se pudo evaluar, y por qué."],
            ].map(([dim, nivel, texto]) => (
              <div key={dim} className="flex flex-wrap items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
                   style={{ borderColor: "var(--border)" }}>
                <strong className="min-w-[11rem] text-sm">{dim}</strong>
                <EvidenceBadge nivel={nivel} />
                <span className="ink-2 flex-1 text-sm leading-snug pretty">{texto}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="mt-8 flex flex-wrap gap-3">
          <PrimaryLink href="/demo">Verlo sobre datos reales <ArrowRight size={16} /></PrimaryLink>
          <GhostLink href="/evidencia">Qué lo sostiene</GhostLink>
        </div>
      </Section>

      <Section tono="alt">
        <Nota tono="aviso">
          <strong>La barandilla que gobierna todo lo anterior.</strong> Esto es un
          tamizaje que orienta: reduce el espacio de búsqueda. No es un diagnóstico,
          no es un cribado validado y no sustituye una evaluación médica.
        </Nota>
      </Section>
    </>
  );
}
