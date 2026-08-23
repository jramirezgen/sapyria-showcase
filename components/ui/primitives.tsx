import Link from "next/link";
import type { ReactNode } from "react";

/** Contenedor de contenido. Un solo sitio donde vive el ancho máximo. */
export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`shell ${className}`}>{children}</div>;
}

export function Section({
  children, id, tono = "base", className = "",
}: { children: ReactNode; id?: string; tono?: "base" | "alt"; className?: string }) {
  return (
    <section
      id={id}
      className={`py-16 sm:py-24 ${tono === "alt" ? "surface-1" : ""} ${className}`}
      style={tono === "alt" ? { borderBlock: "1px solid var(--border)" } : undefined}
    >
      <Shell>{children}</Shell>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="ink-3 mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em]">
      {children}
    </p>
  );
}

export function H2({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`balance text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-4xl ${className}`}>
      {children}
    </h2>
  );
}

export function Card({
  children, className = "", as: Tag = "div",
}: { children: ReactNode; className?: string; as?: "div" | "article" | "li" }) {
  return (
    <Tag
      className={`rounded-xl border p-5 ${className}`}
      style={{ borderColor: "var(--border)", background: "var(--surface-0)" }}
    >
      {children}
    </Tag>
  );
}

/**
 * Una cifra sola, cuando el dato NO necesita un gráfico.
 * Es la forma correcta para un valor único: dibujarle ejes no añade nada.
 */
export function StatTile({
  valor, etiqueta, nota, tono,
}: { valor: ReactNode; etiqueta: string; nota?: string; tono?: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="ink-3 font-mono text-[11px] uppercase tracking-[0.14em]">{etiqueta}</span>
      <strong
        className="text-3xl font-extrabold tracking-[-0.03em] tabular-nums"
        style={tono ? { color: tono } : undefined}
      >
        {valor}
      </strong>
      {nota ? <span className="ink-2 text-sm leading-snug pretty">{nota}</span> : null}
    </Card>
  );
}

/**
 * El nivel de evidencia de una afirmación.
 *
 * Nunca va solo el color: siempre lleva su TEXTO. Un estado que se distingue
 * sólo por el tono desaparece para quien no distingue esos tonos, y en un
 * informe donde la evidencia es la mitad del mensaje eso no es aceptable.
 */
export function EvidenceBadge({ nivel }: { nivel: string }) {
  const mapa: Record<string, { color: string; texto: string }> = {
    alta: { color: "var(--good)", texto: "EVIDENCIA ALTA" },
    media: { color: "var(--warning)", texto: "EVIDENCIA MEDIA" },
    baja: { color: "var(--serious)", texto: "EVIDENCIA BAJA" },
    insuficiente: { color: "var(--ink-3)", texto: "EVIDENCIA INSUFICIENTE" },
    "no-evaluable": { color: "var(--ink-3)", texto: "NO EVALUABLE" },
    "sin-atribucion": { color: "var(--serious)", texto: "SIN ATRIBUCIÓN" },
    hipotesis: { color: "var(--warning)", texto: "HIPÓTESIS" },
  };
  const v = mapa[nivel] ?? { color: "var(--ink-3)", texto: nivel.toUpperCase() };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-medium tracking-[0.1em]"
      style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
    >
      <i aria-hidden className="size-2 rounded-full" style={{ background: v.color }} />
      {v.texto}
    </span>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      style={{ background: "var(--accent)" }}
    >
      {children}
    </Link>
  );
}

export function GhostLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--surface-2)]"
      style={{ borderColor: "var(--border)" }}
    >
      {children}
    </Link>
  );
}

/** Aviso que NO se puede leer por encima. Los límites no van en letra pequeña. */
export function Nota({ children, tono = "info" }: { children: ReactNode; tono?: "info" | "aviso" }) {
  return (
    <div
      className="rounded-lg border-l-4 px-4 py-3 text-sm leading-relaxed pretty"
      style={{
        borderColor: tono === "aviso" ? "var(--serious)" : "var(--accent)",
        background: "var(--surface-1)",
      }}
    >
      {children}
    </div>
  );
}
