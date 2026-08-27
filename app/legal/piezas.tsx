import type { ReactNode } from "react";
import Link from "next/link";
import { Eyebrow, Shell } from "@/components/ui/primitives";

/**
 * Las piezas comunes de los documentos legales.
 *
 * Existen para que privacidad y términos se lean como parte del producto y no
 * como un anexo pegado: misma tipografía, misma paleta, misma retícula. El
 * manual de marca pide «mucho espacio negativo» y «evidencia legible», y un muro
 * de texto legal es justo lo contrario si no se estructura.
 */
export function DocumentoLegal({
  eyebrow, titulo, entradilla, actualizado, children,
}: {
  eyebrow: string; titulo: ReactNode; entradilla: ReactNode;
  actualizado: string; children: ReactNode;
}) {
  return (
    <Shell className="py-14 sm:py-20">
      <div className="max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="balance mt-2 text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
          {titulo}
        </h1>
        <p className="ink-2 mt-6 text-lg leading-relaxed pretty">{entradilla}</p>
        <p className="ink-3 mt-4 font-mono text-[11px] uppercase tracking-[0.14em]">
          Última actualización · {actualizado}
        </p>
      </div>
      <div className="mt-12 max-w-3xl">{children}</div>
      <div className="mt-14 max-w-3xl border-t pt-6" style={{ borderColor: "var(--border)" }}>
        <p className="ink-3 text-sm leading-relaxed pretty">
          ¿Dudas sobre este documento? Escribe a{" "}
          <a href="mailto:info@sapyria.com" className="font-medium" style={{ color: "var(--accent-strong)" }}>
            info@sapyria.com
          </a>
          . También puedes leer{" "}
          <Link href="/privacidad" className="underline">Privacidad</Link> y{" "}
          <Link href="/terminos" className="underline">Términos del servicio</Link>.
        </p>
      </div>
    </Shell>
  );
}

/** Una cláusula. El número ayuda a citarla en un correo o en una consulta. */
export function Clausula({ n, titulo, children }: { n: string; titulo: string; children: ReactNode }) {
  return (
    <section className="border-t py-7 first:border-t-0 first:pt-0" style={{ borderColor: "var(--border)" }}>
      <h2 className="flex gap-3 text-xl font-bold tracking-[-0.02em]">
        <span className="font-mono text-base font-semibold" style={{ color: "var(--accent-strong)" }}>
          {n}
        </span>
        {titulo}
      </h2>
      <div className="ink-2 mt-3 grid gap-3 text-[15px] leading-relaxed pretty">{children}</div>
    </section>
  );
}

/** Lo que no se puede pasar por alto: se destaca, no se esconde en un párrafo. */
export function Destacado({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 px-4 py-3 text-[15px] leading-relaxed pretty"
         style={{ borderColor: "var(--accent)", background: "var(--surface-1)" }}>
      {children}
    </div>
  );
}

export function Lista({ items }: { items: ReactNode[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((x, i) => (
        <li key={i} className="flex gap-2.5">
          <i aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full" style={{ background: "var(--accent)" }} />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}
