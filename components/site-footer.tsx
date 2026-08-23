import Link from "next/link";
import { Brand } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="border-t py-12" style={{ borderColor: "var(--border)" }}>
      <div className="shell grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="ink-2 mt-3 max-w-sm text-sm leading-relaxed pretty">
            Interpretación molecular trazable. Cada resultado viaja con su nivel de
            evidencia, su procedencia y sus límites.
          </p>
        </div>
        <div className="text-sm">
          <p className="ink-3 mb-3 font-mono text-[11px] uppercase tracking-[0.14em]">Producto</p>
          <ul className="ink-2 space-y-2">
            <li><Link href="/como-funciona">Cómo funciona</Link></li>
            <li><Link href="/tecnologia">Tecnología</Link></li>
            <li><Link href="/demo">Demo con datos públicos</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="ink-3 mb-3 font-mono text-[11px] uppercase tracking-[0.14em]">Rigor</p>
          <ul className="ink-2 space-y-2">
            <li><Link href="/evidencia">Evidencia y límites</Link></li>
            <li><Link href="/sobre">Sobre Sapyria</Link></li>
            <li><Link href="/privacidad">Privacidad</Link></li>
            <li><Link href="/terminos">Términos del servicio</Link></li>
            <li><a href="mailto:hola@sapyria.com">hola@sapyria.com</a></li>
          </ul>
        </div>
      </div>
      <div className="shell mt-10 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
           style={{ borderColor: "var(--border)" }}>
        <p className="ink-3">© 2026 Sapyria · Lima, Perú</p>
        <p className="ink-3">
          Sapyria no emite diagnósticos. Los resultados orientan; no sustituyen evaluación médica.
        </p>
      </div>
    </footer>
  );
}
