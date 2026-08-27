"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Brand } from "@/components/brand";

const ENLACES = [
  ["/como-funciona", "Cómo funciona"],
  ["/tecnologia", "Tecnología"],
  ["/demo", "Demo"],
  ["/evidencia", "Evidencia"],
  ["/sobre", "Sobre Sapyria"],
  ["/contacto", "Contacto"],
] as const;

export function SiteNav() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{ borderColor: "var(--border)", background: "color-mix(in oklab, var(--surface-0) 88%, transparent)" }}
    >
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {ENLACES.map(([href, texto]) => {
            const activo = ruta === href || ruta.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-2)]"
                style={activo ? { color: "var(--accent)" } : { color: "var(--ink-2)" }}
              >
                {texto}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contacto"
            className="hidden rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--surface-2)] lg:inline-flex"
            style={{ borderColor: "var(--border)" }}
          >
            Hablar con Sapyria
          </Link>
          <Link
            href="/login"
            className="btn-marca hidden rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:inline-flex"
            style={{ background: "var(--accent)" }}
          >
            Entrar
          </Link>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className="grid size-10 place-items-center rounded-md border md:hidden"
            style={{ borderColor: "var(--border)" }}
          >
            {abierto ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {abierto ? (
        <nav className="border-t md:hidden" style={{ borderColor: "var(--border)" }} aria-label="Principal móvil">
          <div className="shell flex flex-col py-2">
            {ENLACES.map(([href, texto]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setAbierto(false)}
                className="rounded-md px-2 py-3 text-sm font-medium"
                style={{ color: "var(--ink-2)" }}
              >
                {texto}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setAbierto(false)}
              className="mt-2 rounded-lg border px-4 py-3 text-center text-sm font-semibold"
              style={{ borderColor: "var(--border)" }}
            >
              Hablar con Sapyria
            </Link>
            <Link
              href="/login"
              onClick={() => setAbierto(false)}
              className="btn-marca mt-2 rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors"
              style={{ background: "var(--accent)" }}
            >
              Entrar
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
