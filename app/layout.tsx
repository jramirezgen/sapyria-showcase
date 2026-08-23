import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sapyria.com"),
  title: {
    default: "Sapyria — fenotipo molecular trazable",
    template: "%s · Sapyria",
  },
  description:
    "De una muestra de sangre a un fenotipo molecular con su evidencia y sus límites. Demo sobre cohortes públicas reales.",
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Sapyria",
    title: "Sapyria — fenotipo molecular trazable",
    description:
      "Un fenotipo molecular en seis dimensiones, cada una con su nivel de evidencia. Explora la demo sobre datos públicos reales.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:px-4 focus:py-2"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          Saltar al contenido
        </a>
        <SiteNav />
        <main id="contenido" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
